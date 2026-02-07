from typing import Annotated

from fastapi import APIRouter, Depends
from redis.asyncio import Redis

from app.auth.dependencies import get_current_org
from app.executions.router import get_redis
from app.orchestrator.budget import BudgetMonitor
from app.organizations.models import Organization
from app.usage.schemas import BudgetStatusResponse

router = APIRouter(prefix="/api/usage", tags=["usage"])


@router.get("/budget", response_model=BudgetStatusResponse)
async def get_budget_status(
    org: Annotated[Organization, Depends(get_current_org)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    monitor = BudgetMonitor(redis)
    status = await monitor.get_budget_status()
    return BudgetStatusResponse(**status)
