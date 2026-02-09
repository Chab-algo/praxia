import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.batches import service
from app.batches.schemas import (
    BatchCreate,
    BatchDetailResponse,
    BatchItemResponse,
    BatchResponse,
)
from app.db.engine import get_db

logger = structlog.get_logger()

router = APIRouter(prefix="/api/batches", tags=["batches"])


async def get_redis() -> Redis:
    from app.config import settings

    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    try:
        yield redis
    finally:
        await redis.aclose()


@router.post("", response_model=BatchResponse, status_code=201)
async def create_batch(
    body: BatchCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    try:
        batch = await service.create_batch(
            db=db,
            agent_id=uuid.UUID(body.agent_id),
            user_id=user.id,
            name=body.name,
            items=body.items,
            file_type=body.file_type,
        )
        await db.commit()

        # Reload with relationships
        batch = await service.get_batch(db, batch.id, user.id)

        # Enqueue items for processing
        item_ids = [item.id for item in batch.items]
        await service.enqueue_batch(redis, batch.id, item_ids)

        return _to_response(batch)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[BatchResponse])
async def list_batches(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    batches = await service.list_batches(db, user.id)
    return [_to_response(b) for b in batches]


@router.get("/{batch_id}", response_model=BatchDetailResponse)
async def get_batch(
    batch_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    batch = await service.get_batch(db, batch_id, user.id, offset=offset, limit=limit)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return _to_detail_response(batch)


@router.get("/{batch_id}/export")
async def export_batch(
    batch_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    format: str = Query("csv", pattern="^(csv|json)$"),
):
    try:
        content = await service.export_batch(db, batch_id, user.id, fmt=format)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if format == "json":
        return PlainTextResponse(
            content,
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="batch-{batch_id}.json"'},
        )
    return PlainTextResponse(
        content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="batch-{batch_id}.csv"'},
    )


def _to_response(batch) -> BatchResponse:
    recipe_slug = None
    if hasattr(batch, "agent") and batch.agent:
        recipe_slug = batch.agent.recipe_slug

    return BatchResponse(
        id=str(batch.id),
        agent_id=str(batch.agent_id),
        recipe_slug=recipe_slug,
        name=batch.name,
        status=batch.status,
        file_type=batch.file_type,
        total_items=batch.total_items,
        completed_items=batch.completed_items,
        failed_items=batch.failed_items,
        total_cost_cents=float(batch.total_cost_cents),
        created_at=batch.created_at,
        completed_at=batch.completed_at,
    )


def _to_detail_response(batch) -> BatchDetailResponse:
    base = _to_response(batch)
    items = []
    if hasattr(batch, "items") and batch.items:
        items = [
            BatchItemResponse(
                id=str(item.id),
                item_index=item.item_index,
                status=item.status,
                input_data=item.input_data,
                output_data=item.output_data,
                error_data=item.error_data,
                cost_cents=float(item.cost_cents),
                duration_ms=item.duration_ms,
                created_at=item.created_at,
                completed_at=item.completed_at,
            )
            for item in sorted(batch.items, key=lambda i: i.item_index)
        ]

    return BatchDetailResponse(
        **base.model_dump(),
        items=items,
    )
