from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics import service
from app.analytics.schemas import AgentStatsItem, InsightItem, OverviewResponse, TimelineItem, TrendItem
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.engine import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await service.get_overview(db, user.id)


@router.get("/trends", response_model=list[TrendItem])
async def get_trends(
    days: int = Query(30, ge=1, le=365),
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Obtenir les tendances d'utilisation."""
    return await service.get_trends(db, user.id, days=days)


@router.get("/insights", response_model=list[InsightItem])
async def get_insights(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Obtenir des insights automatiques."""
    return await service.get_insights(db, user.id)


@router.get("/agents", response_model=list[AgentStatsItem])
async def get_agent_stats(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await service.get_agent_stats(db, user.id)


@router.get("/timeline", response_model=list[TimelineItem])
async def get_timeline(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(default=30, ge=1, le=90),
):
    return await service.get_timeline(db, user.id, days=days)
