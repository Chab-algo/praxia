import json
import time
from datetime import datetime

import structlog
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.orchestrator.budget import BudgetMonitor
from app.orchestrator.cache import LLMCache
from app.orchestrator.llm_client import llm_client
from app.orchestrator.prompt_builder import prompt_builder
from app.orchestrator.rate_limiter import RateLimiter
from app.orchestrator.router_model import model_router

logger = structlog.get_logger()


class ExecutionResult:
    def __init__(self):
        self.steps: list[dict] = []
        self.output: dict = {}
        self.total_cost_usd: float = 0.0
        self.total_input_tokens: int = 0
        self.total_output_tokens: int = 0
        self.cache_hits: int = 0
        self.models_used: set[str] = set()
        self.duration_ms: int = 0


class OrchestrationEngine:
    """Core engine that executes agent workflows step by step."""

    def __init__(self, redis: Redis):
        self.cache = LLMCache(redis)
        self.budget = BudgetMonitor(redis)
        self.rate_limiter = RateLimiter(redis)

    async def execute(
        self,
        recipe_config: dict,
        input_data: dict,
        org_id: str,
        org_plan: str = "trial",
        recipe_id: str | None = None,
    ) -> ExecutionResult:
        """Execute a recipe workflow with the given input data."""
        result = ExecutionResult()
        start_time = time.time()

        steps = recipe_config.get("steps", [])
        step_outputs: dict[str, dict] = {}  # step_id -> output

        # Build variable context
        variables = {**input_data, "steps": step_outputs}

        for i, step in enumerate(steps):
            step_id = step["id"]
            step_type = step.get("type", "llm_call")
            step_name = step.get("name", f"step_{i}")

            logger.info("step_start", step=step_name, type=step_type, index=i)
            step_start = time.time()

            step_result = {
                "step_index": i,
                "step_name": step_name,
                "step_type": step_type,
                "status": "running",
            }

            try:
                if step_type == "llm_call":
                    output = await self._execute_llm_step(
                        step=step,
                        variables=variables,
                        org_id=org_id,
                        org_plan=org_plan,
                        recipe_id=recipe_id,
                        result=result,
                        step_result=step_result,
                    )
                elif step_type == "transform":
                    output = self._execute_transform_step(step, variables)
                    step_result["model_used"] = None
                    step_result["cost_cents"] = 0
                    step_result["cache_hit"] = False
                else:
                    raise ValueError(f"Unknown step type: {step_type}")

                step_outputs[step_id] = {"output": output}
                variables["steps"] = step_outputs

                step_result["output_data"] = output
                step_result["status"] = "completed"

            except Exception as e:
                step_result["status"] = "failed"
                step_result["error_data"] = {"error": str(e), "type": type(e).__name__}
                logger.error("step_failed", step=step_name, error=str(e))
                raise

            finally:
                step_result["duration_ms"] = int((time.time() - step_start) * 1000)
                result.steps.append(step_result)

        # Build final output from last step or explicit output mapping
        output_mapping = recipe_config.get("output_mapping")
        if output_mapping:
            result.output = {}
            for key, template in output_mapping.items():
                result.output[key] = prompt_builder.render_template(template, variables)
        elif steps:
            last_step_id = steps[-1]["id"]
            result.output = step_outputs.get(last_step_id, {}).get("output", {})

        result.duration_ms = int((time.time() - start_time) * 1000)
        result.models_used = list(result.models_used)

        logger.info(
            "execution_complete",
            duration_ms=result.duration_ms,
            total_cost=f"${result.total_cost_usd:.6f}",
            cache_hits=result.cache_hits,
            steps_count=len(result.steps),
        )

        return result

    async def _execute_llm_step(
        self,
        step: dict,
        variables: dict,
        org_id: str,
        org_plan: str,
        recipe_id: str | None,
        result: ExecutionResult,
        step_result: dict,
    ) -> dict | str:
        """Execute a single LLM step."""
        # Build messages
        messages = prompt_builder.build_messages(
            system_prompt=step["system_prompt"],
            user_prompt=step["user_prompt"],
            variables=variables,
        )

        # Select model
        complexity = step.get("complexity", "generate_short")
        input_tokens = llm_client.count_messages_tokens(messages)
        model = model_router.select(
            complexity=complexity,
            org_plan=org_plan,
            input_tokens=input_tokens,
            force_model=step.get("force_model"),
        )

        # Rate limit check
        await self.rate_limiter.check(org_id, org_plan)

        # Check cache
        cacheable = step.get("cacheable", True)
        if cacheable:
            cache_result = await self.cache.get(
                model=model,
                messages=messages,
                recipe_id=recipe_id,
                step_id=step["id"],
                input_text=messages[-1]["content"] if messages else None,
            )
            if cache_result.hit:
                result.cache_hits += 1
                step_result["cache_hit"] = True
                step_result["model_used"] = model
                step_result["cost_cents"] = 0
                return cache_result.data

        # Budget check
        max_tokens = step.get("max_tokens", 500)
        estimated_cost = self.budget.estimate_cost(model, input_tokens, max_tokens)
        await self.budget.check_and_reserve(estimated_cost)

        # LLM call
        response_format = None
        if step.get("response_format") == "json_object":
            response_format = {"type": "json_object"}

        llm_response = await llm_client.complete(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=step.get("temperature", 0.2),
            response_format=response_format,
        )

        # Record actual cost
        await self.budget.record_actual(estimated_cost, llm_response.cost_usd)

        # Update result tracking
        result.total_cost_usd += llm_response.cost_usd
        result.total_input_tokens += llm_response.input_tokens
        result.total_output_tokens += llm_response.output_tokens
        result.models_used.add(model)

        # Update step result
        step_result["model_used"] = model
        step_result["input_tokens"] = llm_response.input_tokens
        step_result["output_tokens"] = llm_response.output_tokens
        step_result["cost_cents"] = round(llm_response.cost_usd * 100, 6)
        step_result["prompt_hash"] = llm_response.prompt_hash
        step_result["cache_hit"] = False

        # Parse output
        output = llm_response.content
        if step.get("response_format") == "json_object":
            try:
                output = json.loads(output)
            except json.JSONDecodeError:
                logger.warning("json_parse_failed", content=output[:200])

        # Cache the result
        if cacheable:
            await self.cache.set(
                model=model,
                messages=messages,
                response_data=output,
                recipe_id=recipe_id,
                step_id=step["id"],
                input_text=messages[-1]["content"] if messages else None,
            )

        return output

    def _execute_transform_step(self, step: dict, variables: dict) -> dict:
        """Execute a data transform step (no LLM call)."""
        mapping = step.get("mapping", {})
        output = {}
        for key, template in mapping.items():
            output[key] = prompt_builder.render_template(str(template), variables)
        return output
