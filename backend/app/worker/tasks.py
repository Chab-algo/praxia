import uuid

import structlog

logger = structlog.get_logger()


async def execute_agent_task(ctx: dict, execution_id: str) -> dict:
    """ARQ task: execute an agent asynchronously."""
    from redis.asyncio import Redis
    from sqlalchemy.ext.asyncio import AsyncSession

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
