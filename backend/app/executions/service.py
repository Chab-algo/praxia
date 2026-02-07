import uuid
from datetime import datetime
from decimal import Decimal

import structlog
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.models import Agent
from app.executions.models import Execution, ExecutionStep
from app.orchestrator.engine import OrchestrationEngine
from app.recipes import registry
from app.recipes import service as recipe_service

logger = structlog.get_logger()


async def create_execution(
    db: AsyncSession,
    agent_id: uuid.UUID,
    user_id: uuid.UUID,
    input_data: dict,
    triggered_by: str = "api",
) -> Execution:
    execution = Execution(
        agent_id=agent_id,
        user_id=user_id,
        input_data=input_data,
        status="pending",
        triggered_by=triggered_by,
        triggered_by_user_id=user_id,
    )
    db.add(execution)
    await db.flush()
    return execution


async def run_execution(
    db: AsyncSession,
    redis: Redis,
    execution_id: uuid.UUID,
) -> Execution:
    """Run an execution synchronously (for now, later via ARQ worker)."""
    execution = await db.scalar(
        select(Execution).where(Execution.id == execution_id)
    )
    if not execution:
        raise ValueError(f"Execution {execution_id} not found")

    # Load agent
    agent = await db.scalar(select(Agent).where(Agent.id == execution.agent_id))
    if not agent:
        raise ValueError(f"Agent {execution.agent_id} not found")

    # Get recipe config from the agent's recipe_slug field
    recipe_slug = agent.recipe_slug
    if not recipe_slug:
        raise ValueError(f"Agent {agent.id} has no recipe_slug configured")
    
    # First try to get from registry (public recipes)
    recipe = registry.get_recipe(recipe_slug)
    
    # If not found in registry, try database (custom recipes)
    if not recipe:
        recipe_db = await recipe_service.get_custom_recipe_by_slug(
            db=db,
            slug=recipe_slug,
            user_id=execution.user_id,
        )
        if recipe_db:
            # Convert database recipe to dict format
            recipe = recipe_db.config
        else:
            raise ValueError(f"Recipe '{recipe_slug}' not found")

    # Default plan for user-scoped execution
    org_plan = "trial"

    # Mark as running
    execution.status = "running"
    execution.started_at = datetime.utcnow()
    await db.flush()

    # Execute
    engine = OrchestrationEngine(redis)
    try:
        result = await engine.execute(
            recipe_config=recipe,
            input_data=execution.input_data,
            org_id=str(execution.user_id),
            org_plan=org_plan,
            recipe_id=recipe_slug,
        )

        # Update execution
        execution.status = "completed"
        execution.output_data = result.output
        execution.total_input_tokens = result.total_input_tokens
        execution.total_output_tokens = result.total_output_tokens
        execution.total_cost_cents = Decimal(str(round(result.total_cost_usd * 100, 4)))
        execution.cache_hits = result.cache_hits
        execution.models_used = list(result.models_used) if isinstance(result.models_used, set) else result.models_used
        execution.completed_at = datetime.utcnow()
        execution.duration_ms = result.duration_ms

        # Create step records
        for step_data in result.steps:
            step = ExecutionStep(
                execution_id=execution.id,
                step_index=step_data["step_index"],
                step_name=step_data["step_name"],
                step_type=step_data["step_type"],
                model_used=step_data.get("model_used"),
                prompt_hash=step_data.get("prompt_hash"),
                input_tokens=step_data.get("input_tokens", 0),
                output_tokens=step_data.get("output_tokens", 0),
                cost_cents=step_data.get("cost_cents", 0),
                cache_hit=step_data.get("cache_hit", False),
                input_data=step_data.get("input_data"),
                output_data=step_data.get("output_data"),
                status=step_data["status"],
                duration_ms=step_data.get("duration_ms"),
            )
            db.add(step)

        await db.flush()
        await _update_usage_daily(db, execution)
        logger.info(
            "execution_completed",
            execution_id=str(execution.id),
            cost=f"${result.total_cost_usd:.6f}",
        )

    except Exception as e:
        execution.status = "failed"
        execution.error_data = {"error": str(e), "type": type(e).__name__}
        execution.completed_at = datetime.utcnow()
        await db.flush()
        await _update_usage_daily(db, execution)
        logger.error("execution_failed", execution_id=str(execution.id), error=str(e))
        raise

    return execution


async def get_execution(
    db: AsyncSession, execution_id: uuid.UUID, user_id: uuid.UUID
) -> Execution | None:
    return await db.scalar(
        select(Execution)
        .options(selectinload(Execution.steps))
        .where(Execution.id == execution_id, Execution.user_id == user_id)
    )


async def list_executions(
    db: AsyncSession, user_id: uuid.UUID, limit: int = 50
) -> list[Execution]:
    result = await db.scalars(
        select(Execution)
        .where(Execution.user_id == user_id)
        .order_by(Execution.created_at.desc())
        .limit(limit)
    )
    return list(result.all())


async def _update_usage_daily(db: AsyncSession, execution: Execution) -> None:
    """Upsert usage_daily record for this execution's user + date."""
    from app.usage.models import UsageDaily

    exec_date = (execution.completed_at or execution.created_at).date()
    is_success = execution.status == "completed"
    is_failed = execution.status == "failed"

    # Determine model tier counts from models_used
    models = execution.models_used or []
    nano = sum(1 for m in models if "nano" in m)
    mini = sum(1 for m in models if "mini" in m)
    full = sum(1 for m in models if m == "gpt-4.1")

    existing = await db.scalar(
        select(UsageDaily).where(
            UsageDaily.user_id == execution.user_id,
            UsageDaily.date == exec_date,
        )
    )

    if existing:
        existing.total_executions += 1
        existing.successful_executions += int(is_success)
        existing.failed_executions += int(is_failed)
        existing.total_input_tokens += execution.total_input_tokens
        existing.total_output_tokens += execution.total_output_tokens
        existing.total_cost_cents += execution.total_cost_cents
        existing.nano_calls += nano
        existing.mini_calls += mini
        existing.full_calls += full
        existing.cache_hits += execution.cache_hits
    else:
        record = UsageDaily(
            user_id=execution.user_id,
            date=exec_date,
            total_executions=1,
            successful_executions=int(is_success),
            failed_executions=int(is_failed),
            total_input_tokens=execution.total_input_tokens,
            total_output_tokens=execution.total_output_tokens,
            total_cost_cents=execution.total_cost_cents,
            nano_calls=nano,
            mini_calls=mini,
            full_calls=full,
            cache_hits=execution.cache_hits,
        )
        db.add(record)

    await db.flush()
