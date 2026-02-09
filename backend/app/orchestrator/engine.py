import json
import time
from datetime import datetime

import structlog
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.orchestrator.budget import BudgetMonitor
from app.orchestrator.cache import LLMCache
from app.orchestrator.llm_client import get_llm_client
from app.orchestrator.prompt_builder import prompt_builder
from app.orchestrator.rate_limiter import RateLimiter
from app.orchestrator.router_model import model_router
from app.orchestrator.vision import is_base64_image
from app.orchestrator.audio import is_audio_data

logger = structlog.get_logger()


def _is_image_data(data: str) -> bool:
    """Check if a string contains image data."""
    if not isinstance(data, str):
        return False
    # Check for base64 image patterns
    if data.startswith("data:image/"):
        return True
    if len(data) > 100 and is_base64_image(data):
        return True
    return False


def _is_audio_data(data: str) -> bool:
    """Check if a string contains audio data."""
    if not isinstance(data, str):
        return False
    return is_audio_data(data)


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
        user_id: str,
        user_plan: str = "trial",
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
                        user_id=user_id,
                        user_plan=user_plan,
                        recipe_id=recipe_id,
                        result=result,
                        step_result=step_result,
                    )
                elif step_type == "audio":
                    output = await self._execute_audio_step(
                        step=step,
                        variables=variables,
                        user_id=user_id,
                        user_plan=user_plan,
                        recipe_id=recipe_id,
                        result=result,
                        step_result=step_result,
                        audio_data=variables.get("audio") or variables.get("audio_data"),
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
                result.output[key] = prompt_builder.render_value(template, variables)
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
        user_id: str,
        user_plan: str,
        recipe_id: str | None,
        result: ExecutionResult,
        step_result: dict,
    ) -> dict | str:
        """Execute a single LLM step."""
        # Check if this step requires vision
        requires_vision = step.get("vision", False)
        
        # Check if input data contains images or audio
        has_images = False
        has_audio = False
        image_data = None
        audio_data = None
        
        if not requires_vision:
            # Check variables for image/audio data
            for key, value in variables.items():
                if isinstance(value, str):
                    if _is_image_data(value):
                        has_images = True
                        image_data = value
                    elif _is_audio_data(value):
                        has_audio = True
                        audio_data = value
        
        # Use vision if explicitly requested or images detected
        if requires_vision or has_images:
            return await self._execute_vision_step(
                step=step,
                variables=variables,
                user_id=user_id,
                user_plan=user_plan,
                recipe_id=recipe_id,
                result=result,
                step_result=step_result,
                image_data=image_data or variables.get("image") or variables.get("image_data"),
            )
        
        # Note: Audio steps are handled separately in the main loop
        # This is just for LLM steps that might process audio transcripts
        
        # Build messages
        messages = prompt_builder.build_messages(
            system_prompt=step["system_prompt"],
            user_prompt=step["user_prompt"],
            variables=variables,
        )

        # Select model
        complexity = step.get("complexity", "generate_short")
        client = get_llm_client()
        input_tokens = client.count_messages_tokens(messages)
        model = model_router.select(
            complexity=complexity,
            org_plan=user_plan,
            input_tokens=input_tokens,
            force_model=step.get("force_model"),
        )

        # Rate limit check
        await self.rate_limiter.check(user_id, user_plan)

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

        llm_response = await client.complete(
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

    async def _execute_vision_step(
        self,
        step: dict,
        variables: dict,
        user_id: str,
        user_plan: str,
        recipe_id: str | None,
        result: ExecutionResult,
        step_result: dict,
        image_data: str | None,
    ) -> dict | str:
        """Execute a vision step (image analysis)."""
        from app.orchestrator.vision import analyze_image, prepare_image_content
        
        if not image_data:
            raise ValueError("Image data required for vision step")

        # Build prompt
        system_prompt = prompt_builder.render_template(step["system_prompt"], variables)
        user_prompt = prompt_builder.render_template(step["user_prompt"], variables)

        # Select vision model
        vision_model = step.get("vision_model", "gpt-4o-mini")
        max_tokens = step.get("max_tokens", 500)

        # Rate limit check
        await self.rate_limiter.check(user_id, user_plan)

        # Budget check (estimate for vision)
        estimated_cost = 0.001  # Conservative estimate
        await self.budget.check_and_reserve(estimated_cost)

        # Analyze image
        vision_result = await analyze_image(
            image_data=image_data,
            prompt=f"{system_prompt}\n\n{user_prompt}",
            model=vision_model,
            max_tokens=max_tokens,
        )

        # Record actual cost
        await self.budget.record_actual(estimated_cost, vision_result["cost_usd"])

        # Update result tracking
        result.total_cost_usd += vision_result["cost_usd"]
        result.total_input_tokens += vision_result["input_tokens"]
        result.total_output_tokens += vision_result["output_tokens"]
        result.models_used.add(vision_result["model"])

        # Update step result
        step_result["model_used"] = vision_result["model"]
        step_result["input_tokens"] = vision_result["input_tokens"]
        step_result["output_tokens"] = vision_result["output_tokens"]
        step_result["cost_cents"] = round(vision_result["cost_usd"] * 100, 6)
        step_result["cache_hit"] = False
        step_result["vision"] = True

        # Parse output
        output = vision_result["content"]
        if step.get("response_format") == "json_object":
            try:
                output = json.loads(output)
            except json.JSONDecodeError:
                logger.warning("json_parse_failed", content=output[:200])

        return output

    async def _execute_audio_step(
        self,
        step: dict,
        variables: dict,
        user_id: str,
        user_plan: str,
        recipe_id: str | None,
        result: ExecutionResult,
        step_result: dict,
        audio_data: str | None,
    ) -> dict | str:
        """Execute an audio transcription step."""
        from app.orchestrator.audio import transcribe_audio
        
        if not audio_data:
            raise ValueError("Audio data required for audio step")

        # Get language from step or variables
        language = step.get("language") or variables.get("language")

        # Rate limit check
        await self.rate_limiter.check(user_id, user_plan)

        # Budget check (Whisper pricing: $0.006 per minute)
        estimated_cost = 0.01  # Conservative estimate
        await self.budget.check_and_reserve(estimated_cost)

        # Transcribe audio
        transcription_result = await transcribe_audio(
            audio_data=audio_data,
            language=language,
        )

        # Record actual cost (approximate, Whisper is per minute)
        await self.budget.record_actual(estimated_cost, estimated_cost)

        # Update result tracking
        result.total_cost_usd += estimated_cost
        result.models_used.add("whisper-1")

        # Update step result
        step_result["model_used"] = "whisper-1"
        step_result["input_tokens"] = 0  # Audio doesn't use tokens
        step_result["output_tokens"] = 0
        step_result["cost_cents"] = round(estimated_cost * 100, 6)
        step_result["cache_hit"] = False
        step_result["audio"] = True

        # Add transcript to variables for next steps
        variables["transcript"] = transcription_result["text"]

        # Return transcript text
        return transcription_result["text"]

    def _execute_transform_step(self, step: dict, variables: dict) -> dict:
        """Execute a data transform step (no LLM call)."""
        mapping = step.get("mapping", {})
        output = {}
        for key, template in mapping.items():
            output[key] = prompt_builder.render_value(template, variables)
        return output
