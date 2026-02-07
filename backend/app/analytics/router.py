from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics import service
from app.analytics.schemas import AgentStatsItem, OverviewResponse, TimelineItem
from app.auth.dependencies import get_current_org
from app.db.engine import get_db
from app.organizations.models import Organization

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await service.get_overview(db, org.id)


@router.get("/agents", response_model=list[AgentStatsItem])
async def get_agent_stats(
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await service.get_agent_stats(db, org.id)


@router.get("/timeline", response_model=list[TimelineItem])
async def get_timeline(
    org: Annotated[Organization, Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(default=30, ge=1, le=90),
):
    return await service.get_timeline(db, org.id, days=days)
