import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.engine import get_db
from app.recommendations import service

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/recipes")
async def get_recipe_recommendations(
    domain: Optional[str] = Query(None),
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Obtenir des recommandations de recipes."""
    recommendations = await service.get_recipe_recommendations(
        db=db,
        user_id=user.id,
        domain=domain,
    )
    return recommendations


@router.get("/optimizations")
async def get_optimization_recommendations(
    agent_id: uuid.UUID = Query(...),
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Obtenir des recommandations d'optimisation pour un agent."""
    # Verify agent belongs to user
    from app.agents.models import Agent

    agent = await db.get(Agent, agent_id)
    if not agent or agent.created_by != user.id:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Agent not found")

    recommendations = await service.get_optimization_recommendations(
        db=db,
        agent_id=agent_id,
    )
    return recommendations
