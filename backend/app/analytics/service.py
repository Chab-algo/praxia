import uuid
from datetime import date, timedelta

import structlog
from sqlalchemy import Date, case, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.models import Agent
from app.executions.models import Execution

logger = structlog.get_logger()


async def get_overview(db: AsyncSession, user_id: uuid.UUID) -> dict:
    """Global stats for the user."""
    result = await db.execute(
        select(
            func.count(Execution.id).label("total_executions"),
            func.count(case((Execution.status == "completed", 1))).label("successful"),
            func.count(case((Execution.status == "failed", 1))).label("failed"),
            func.coalesce(func.sum(Execution.total_cost_cents), 0).label("total_cost_cents"),
            func.coalesce(func.sum(Execution.total_input_tokens), 0).label("total_input_tokens"),
            func.coalesce(func.sum(Execution.total_output_tokens), 0).label("total_output_tokens"),
            func.coalesce(func.sum(Execution.cache_hits), 0).label("total_cache_hits"),
            func.coalesce(func.avg(Execution.duration_ms), 0).label("avg_duration_ms"),
        ).where(Execution.user_id == user_id)
    )
    row = result.one()

    total = row.total_executions
    successful = row.successful

    return {
        "total_executions": total,
        "successful_executions": successful,
        "failed_executions": row.failed,
        "success_rate": round((successful / total * 100), 1) if total > 0 else 0.0,
        "total_cost_cents": float(row.total_cost_cents),
        "total_input_tokens": int(row.total_input_tokens),
        "total_output_tokens": int(row.total_output_tokens),
        "total_cache_hits": int(row.total_cache_hits),
        "avg_duration_ms": round(float(row.avg_duration_ms)),
        "avg_cost_cents": round(float(row.total_cost_cents) / total, 4) if total > 0 else 0.0,
    }


async def get_agent_stats(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    """Per-agent execution statistics."""
    result = await db.execute(
        select(
            Agent.id,
            Agent.name,
            Agent.recipe_slug,
            Agent.status,
            func.count(Execution.id).label("execution_count"),
            func.count(case((Execution.status == "completed", 1))).label("successful"),
            func.coalesce(func.sum(Execution.total_cost_cents), 0).label("total_cost_cents"),
            func.coalesce(func.avg(Execution.total_cost_cents), 0).label("avg_cost_cents"),
            func.coalesce(func.avg(Execution.duration_ms), 0).label("avg_duration_ms"),
            func.coalesce(func.sum(Execution.cache_hits), 0).label("cache_hits"),
        )
        .outerjoin(Execution, Execution.agent_id == Agent.id)
        .where(Agent.created_by == user_id, Agent.deleted_at.is_(None))
        .group_by(Agent.id)
        .order_by(func.count(Execution.id).desc())
    )

    rows = result.all()
    return [
        {
            "agent_id": str(row.id),
            "agent_name": row.name,
            "recipe_slug": row.recipe_slug,
            "agent_status": row.status,
            "execution_count": row.execution_count,
            "successful_executions": row.successful,
            "success_rate": round((row.successful / row.execution_count * 100), 1)
            if row.execution_count > 0
            else 0.0,
            "total_cost_cents": float(row.total_cost_cents),
            "avg_cost_cents": round(float(row.avg_cost_cents), 4),
            "avg_duration_ms": round(float(row.avg_duration_ms)),
            "cache_hits": int(row.cache_hits),
        }
        for row in rows
    ]


async def get_timeline(
    db: AsyncSession, user_id: uuid.UUID, days: int = 30
) -> list[dict]:
    """Daily execution and cost data for charts."""
    since = date.today() - timedelta(days=days)

    result = await db.execute(
        select(
            cast(Execution.created_at, Date).label("day"),
            func.count(Execution.id).label("executions"),
            func.count(case((Execution.status == "completed", 1))).label("successful"),
            func.count(case((Execution.status == "failed", 1))).label("failed"),
            func.coalesce(func.sum(Execution.total_cost_cents), 0).label("cost_cents"),
            func.coalesce(func.sum(Execution.total_input_tokens), 0).label("input_tokens"),
            func.coalesce(func.sum(Execution.total_output_tokens), 0).label("output_tokens"),
        )
        .where(
            Execution.user_id == user_id,
            cast(Execution.created_at, Date) >= since,
        )
        .group_by(cast(Execution.created_at, Date))
        .order_by(cast(Execution.created_at, Date))
    )

    rows = result.all()
    return [
        {
            "date": row.day.isoformat(),
            "executions": row.executions,
            "successful": row.successful,
            "failed": row.failed,
            "cost_cents": float(row.cost_cents),
            "input_tokens": int(row.input_tokens),
            "output_tokens": int(row.output_tokens),
        }
        for row in rows
    ]
