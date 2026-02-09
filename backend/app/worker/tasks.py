import uuid

import structlog

logger = structlog.get_logger()


async def execute_agent_task(ctx: dict, execution_id: str) -> dict:
    """ARQ task: execute an agent asynchronously."""
    from redis.asyncio import Redis

    from app.db.engine import get_session_maker
    from app.executions.service import run_execution

    logger.info("worker_executing", execution_id=execution_id)

    redis: Redis = ctx.get("redis")
    session_maker = get_session_maker()

    async with session_maker() as db:
        try:
            execution = await run_execution(db, redis, uuid.UUID(execution_id))
            await db.commit()
            return {"status": execution.status, "execution_id": execution_id}
        except Exception as e:
            await db.rollback()
            logger.error("worker_execution_failed", execution_id=execution_id, error=str(e))
            return {"status": "failed", "error": str(e)}


async def process_batch_item_task(ctx: dict, batch_id: str, item_id: str) -> dict:
    """ARQ task: process a single batch item."""
    from redis.asyncio import Redis

    from app.batches.service import process_batch_item
    from app.db.engine import get_session_maker

    logger.info("worker_batch_item", batch_id=batch_id, item_id=item_id)

    redis: Redis = ctx.get("redis")
    session_maker = get_session_maker()

    async with session_maker() as db:
        try:
            await process_batch_item(
                db, redis, uuid.UUID(batch_id), uuid.UUID(item_id)
            )
            await db.commit()
            return {"status": "ok", "batch_id": batch_id, "item_id": item_id}
        except Exception as e:
            await db.rollback()
            logger.error(
                "worker_batch_item_failed",
                batch_id=batch_id,
                item_id=item_id,
                error=str(e),
            )
            return {"status": "failed", "error": str(e)}
