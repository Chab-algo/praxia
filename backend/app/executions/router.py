import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents import service as agent_service
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.engine import get_db
from app.executions import service
from app.executions.schemas import ExecutionCreate, ExecutionResponse, ExecutionStepResponse

logger = structlog.get_logger()

router = APIRouter(prefix="/api/executions", tags=["executions"])


async def get_redis() -> Redis:
    from app.config import settings

    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    try:
        yield redis
    finally:
        await redis.aclose()


@router.post("", response_model=ExecutionResponse, status_code=201)
async def create_and_run_execution(
    body: ExecutionCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    agent_uuid = uuid.UUID(body.agent_id)

    # Verify agent belongs to user
    agent = await agent_service.get_agent(db, agent_uuid, user.id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Create execution
    execution = await service.create_execution(
        db=db,
        agent_id=agent_uuid,
        user_id=user.id,
        input_data=body.input_data,
    )

    # Run synchronously for now (will be async via ARQ later)
    try:
        execution = await service.run_execution(db, redis, execution.id)
    except Exception as e:
        # Execution already marked as failed in service
        pass

    # Reload with steps
    execution = await service.get_execution(db, execution.id, user.id)

    return _to_response(execution)


@router.get("", response_model=list[ExecutionResponse])
async def list_executions(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    executions = await service.list_executions(db, user.id)
    return [_to_response(e) for e in executions]


@router.get("/{execution_id}", response_model=ExecutionResponse)
async def get_execution(
    execution_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    execution = await service.get_execution(db, execution_id, user.id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return _to_response(execution)


def _to_response(execution) -> ExecutionResponse:
    steps = []
    if hasattr(execution, "steps") and execution.steps:
        steps = [
            ExecutionStepResponse(
                step_index=s.step_index,
                step_name=s.step_name,
                step_type=s.step_type,
                model_used=s.model_used,
                input_tokens=s.input_tokens,
                output_tokens=s.output_tokens,
                cost_cents=float(s.cost_cents),
                cache_hit=s.cache_hit,
                status=s.status,
                duration_ms=s.duration_ms,
                output_data=s.output_data,
            )
            for s in sorted(execution.steps, key=lambda s: s.step_index)
        ]

    return ExecutionResponse(
        id=str(execution.id),
        agent_id=str(execution.agent_id),
        status=execution.status,
        input_data=execution.input_data,
        output_data=execution.output_data,
        error_data=execution.error_data,
        total_input_tokens=execution.total_input_tokens,
        total_output_tokens=execution.total_output_tokens,
        total_cost_cents=float(execution.total_cost_cents),
        cache_hits=execution.cache_hits,
        models_used=execution.models_used or [],
        duration_ms=execution.duration_ms,
        triggered_by=execution.triggered_by,
        created_at=execution.created_at,
        steps=steps,
    )
