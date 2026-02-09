import csv
import io
import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

import structlog
from redis.asyncio import Redis
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.models import Agent
from app.batches.models import BatchExecution, BatchItem
from app.executions import service as execution_service

logger = structlog.get_logger()

MAX_BATCH_SIZE = 100


async def create_batch(
    db: AsyncSession,
    agent_id: uuid.UUID,
    user_id: uuid.UUID,
    name: str,
    items: list[dict],
    file_type: str = "csv",
) -> BatchExecution:
    """Create a batch execution with all items."""
    if len(items) == 0:
        raise ValueError("Batch must contain at least 1 item")
    if len(items) > MAX_BATCH_SIZE:
        raise ValueError(f"Batch exceeds maximum of {MAX_BATCH_SIZE} items")

    # Verify agent belongs to user
    agent = await db.scalar(
        select(Agent).where(Agent.id == agent_id, Agent.created_by == user_id)
    )
    if not agent:
        raise ValueError("Agent not found")

    batch = BatchExecution(
        agent_id=agent_id,
        user_id=user_id,
        name=name,
        status="pending",
        file_type=file_type,
        total_items=len(items),
    )
    db.add(batch)
    await db.flush()

    for i, item_data in enumerate(items):
        item = BatchItem(
            batch_id=batch.id,
            item_index=i,
            status="pending",
            input_data=item_data,
        )
        db.add(item)

    await db.flush()

    logger.info(
        "batch_created",
        batch_id=str(batch.id),
        total_items=len(items),
        agent_id=str(agent_id),
    )
    return batch


async def enqueue_batch(redis: Redis, batch_id: uuid.UUID, item_ids: list[uuid.UUID]) -> None:
    """Enqueue all batch items as ARQ jobs."""
    from arq.connections import ArqRedis

    arq_redis = ArqRedis(redis)
    for item_id in item_ids:
        await arq_redis.enqueue_job(
            "process_batch_item_task",
            str(batch_id),
            str(item_id),
        )

    logger.info(
        "batch_enqueued",
        batch_id=str(batch_id),
        jobs=len(item_ids),
    )


async def process_batch_item(
    db: AsyncSession,
    redis: Redis,
    batch_id: uuid.UUID,
    item_id: uuid.UUID,
) -> None:
    """Process a single batch item: create execution, run it, update batch stats."""
    item = await db.scalar(
        select(BatchItem).where(BatchItem.id == item_id)
    )
    if not item:
        raise ValueError(f"BatchItem {item_id} not found")

    # Idempotency: skip if already processed (e.g. ARQ retry)
    if item.status in ("completed", "failed"):
        logger.info("batch_item_already_processed", item_id=str(item_id))
        return

    # Lock batch row to prevent concurrent counter updates
    batch = await db.scalar(
        select(BatchExecution)
        .with_for_update()
        .options(selectinload(BatchExecution.agent))
        .where(BatchExecution.id == batch_id)
    )
    if not batch:
        raise ValueError(f"Batch {batch_id} not found")

    # Mark batch as processing if still pending
    if batch.status == "pending":
        batch.status = "processing"
        await db.flush()

    # Mark item as processing
    item.status = "processing"
    await db.flush()

    try:
        # Create and run execution using existing execution service
        execution = await execution_service.create_execution(
            db=db,
            agent_id=batch.agent_id,
            user_id=batch.user_id,
            input_data=item.input_data,
            triggered_by="batch",
        )

        execution = await execution_service.run_execution(db, redis, execution.id)

        # Copy results to batch item
        item.status = "completed"
        item.output_data = execution.output_data
        item.execution_id = execution.id
        item.cost_cents = execution.total_cost_cents
        item.duration_ms = execution.duration_ms
        item.completed_at = datetime.utcnow()

        batch.completed_items += 1
        batch.total_cost_cents += execution.total_cost_cents

    except Exception as e:
        item.status = "failed"
        item.error_data = {"error": str(e), "type": type(e).__name__}
        item.completed_at = datetime.utcnow()
        batch.failed_items += 1

        logger.error(
            "batch_item_failed",
            batch_id=str(batch_id),
            item_id=str(item_id),
            error=str(e),
        )

    # Check if batch is complete
    processed = batch.completed_items + batch.failed_items
    if processed >= batch.total_items:
        if batch.failed_items == 0:
            batch.status = "completed"
        elif batch.completed_items == 0:
            batch.status = "failed"
        else:
            batch.status = "partial_failure"
        batch.completed_at = datetime.utcnow()

        logger.info(
            "batch_completed",
            batch_id=str(batch_id),
            status=batch.status,
            completed=batch.completed_items,
            failed=batch.failed_items,
        )

    await db.flush()

    # Send webhook if configured
    if batch.agent and batch.agent.webhook_url and item.status in ("completed", "failed"):
        try:
            from app.webhooks.sender import send_webhook

            await send_webhook(
                webhook_url=batch.agent.webhook_url,
                payload={
                    "event": "batch_item.completed",
                    "agent_id": str(batch.agent_id),
                    "batch_id": str(batch_id),
                    "item_index": item.item_index,
                    "execution_id": str(item.execution_id) if item.execution_id else None,
                    "status": item.status,
                    "output_data": item.output_data,
                    "cost_cents": float(item.cost_cents),
                    "duration_ms": item.duration_ms,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
        except Exception as e:
            logger.warning("webhook_failed", error=str(e))


async def get_batch(
    db: AsyncSession,
    batch_id: uuid.UUID,
    user_id: uuid.UUID,
    offset: int = 0,
    limit: int = 50,
) -> BatchExecution | None:
    """Get batch with paginated items."""
    batch = await db.scalar(
        select(BatchExecution)
        .options(selectinload(BatchExecution.agent))
        .where(
            BatchExecution.id == batch_id,
            BatchExecution.user_id == user_id,
        )
    )
    if not batch:
        return None

    # Load items with pagination
    items_result = await db.scalars(
        select(BatchItem)
        .where(BatchItem.batch_id == batch_id)
        .order_by(BatchItem.item_index)
        .offset(offset)
        .limit(limit)
    )
    batch.items = list(items_result.all())
    return batch


async def list_batches(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int = 50,
) -> list[BatchExecution]:
    """List batches for a user (without items)."""
    result = await db.scalars(
        select(BatchExecution)
        .options(selectinload(BatchExecution.agent))
        .where(BatchExecution.user_id == user_id)
        .order_by(BatchExecution.created_at.desc())
        .limit(limit)
    )
    return list(result.all())


async def export_batch(
    db: AsyncSession,
    batch_id: uuid.UUID,
    user_id: uuid.UUID,
    fmt: str = "csv",
) -> str:
    """Export batch results as CSV or JSON."""
    batch = await db.scalar(
        select(BatchExecution).where(
            BatchExecution.id == batch_id,
            BatchExecution.user_id == user_id,
        )
    )
    if not batch:
        raise ValueError("Batch not found")

    items_result = await db.scalars(
        select(BatchItem)
        .where(BatchItem.batch_id == batch_id)
        .order_by(BatchItem.item_index)
    )
    items = list(items_result.all())

    if fmt == "json":
        return json.dumps(
            [
                {
                    "item_index": item.item_index,
                    "status": item.status,
                    "input_data": item.input_data,
                    "output_data": item.output_data,
                    "error_data": item.error_data,
                    "cost_cents": float(item.cost_cents),
                    "duration_ms": item.duration_ms,
                }
                for item in items
            ],
            indent=2,
            default=str,
        )

    # CSV export: flatten input + output
    output = io.StringIO()
    if not items:
        return ""

    # Collect all possible keys from inputs and outputs
    input_keys: set[str] = set()
    output_keys: set[str] = set()
    for item in items:
        if item.input_data:
            input_keys.update(item.input_data.keys())
        if item.output_data:
            output_keys.update(item.output_data.keys())

    sorted_input_keys = sorted(input_keys)
    sorted_output_keys = sorted(output_keys)

    headers = (
        ["item_index", "status"]
        + [f"input_{k}" for k in sorted_input_keys]
        + [f"output_{k}" for k in sorted_output_keys]
        + ["cost_cents", "duration_ms"]
    )

    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()

    for item in items:
        row: dict = {
            "item_index": item.item_index,
            "status": item.status,
            "cost_cents": float(item.cost_cents),
            "duration_ms": item.duration_ms,
        }
        for k in sorted_input_keys:
            val = (item.input_data or {}).get(k, "")
            row[f"input_{k}"] = json.dumps(val) if isinstance(val, (dict, list)) else val
        for k in sorted_output_keys:
            val = (item.output_data or {}).get(k, "")
            row[f"output_{k}"] = json.dumps(val) if isinstance(val, (dict, list)) else val
        writer.writerow(row)

    return output.getvalue()


async def cleanup_stuck_items(db: AsyncSession, timeout_minutes: int = 10) -> int:
    """Mark items stuck in 'processing' for too long as failed."""
    cutoff = datetime.utcnow() - timedelta(minutes=timeout_minutes)
    result = await db.execute(
        update(BatchItem)
        .where(
            BatchItem.status == "processing",
            BatchItem.created_at < cutoff,
        )
        .values(
            status="failed",
            error_data={"error": "Task timeout", "type": "TimeoutError"},
            completed_at=datetime.utcnow(),
        )
    )
    count = result.rowcount
    if count > 0:
        logger.warning("cleanup_stuck_items", count=count, timeout_minutes=timeout_minutes)
    return count
