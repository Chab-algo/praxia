import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.engine import get_db
from app.workflows.automations import BusinessWorkflow

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.post("/leads/{lead_id}/on-created")
async def trigger_lead_created_workflow(
    lead_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Déclenche le workflow quand un lead est créé."""
    workflow = BusinessWorkflow(db)
    await workflow.on_lead_created(lead_id)
    await db.commit()
    return {"status": "processed"}


@router.post("/clients/{client_id}/check-health")
async def check_client_health_workflow(
    client_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Vérifie la santé d'un client."""
    workflow = BusinessWorkflow(db)
    result = await workflow.check_client_health(client_id)
    await db.commit()
    return result


@router.post("/leads/check-inactive")
async def check_inactive_leads_workflow(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = 30,
):
    """Vérifie les leads inactifs."""
    workflow = BusinessWorkflow(db)
    inactive_lead_ids = await workflow.check_inactive_leads(days=days)
    await db.commit()
    return {"inactive_leads": [str(id) for id in inactive_lead_ids]}
