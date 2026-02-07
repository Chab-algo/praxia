import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, get_current_org
from app.auth.models import User
from app.crm import service
from app.crm.schemas import (
    InteractionCreate,
    InteractionResponse,
    LeadCreate,
    LeadDetailResponse,
    LeadResponse,
    LeadUpdate,
)
from app.db.engine import get_db
from app.organizations.models import Organization

router = APIRouter(prefix="/api/crm", tags=["crm"])


@router.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(
    body: LeadCreate,
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Optional[Organization], Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Créer un nouveau lead."""
    try:
        lead = await service.create_lead(
            db=db,
            user_id=user.id,
            lead_data=body.model_dump(),
            organization_id=org.id if org else None,
        )
        await db.commit()
        return LeadResponse(
            id=str(lead.id),
            email=lead.email,
            full_name=lead.full_name,
            company=lead.company,
            phone=lead.phone,
            job_title=lead.job_title,
            status=lead.status,
            source=lead.source,
            score=lead.score,
            notes=lead.notes,
            assigned_to=str(lead.assigned_to) if lead.assigned_to else None,
            created_at=lead.created_at,
            updated_at=lead.updated_at,
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/leads", response_model=list[LeadResponse])
async def list_leads(
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Optional[Organization], Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: Optional[str] = None,
):
    """Lister les leads."""
    leads = await service.list_leads(
        db=db,
        user_id=user.id,
        status=status,
        organization_id=org.id if org else None,
    )
    return [
        LeadResponse(
            id=str(l.id),
            email=l.email,
            full_name=l.full_name,
            company=l.company,
            phone=l.phone,
            job_title=l.job_title,
            status=l.status,
            source=l.source,
            score=l.score,
            notes=l.notes,
            assigned_to=str(l.assigned_to) if l.assigned_to else None,
            created_at=l.created_at,
            updated_at=l.updated_at,
        )
        for l in leads
    ]


@router.get("/leads/{lead_id}", response_model=LeadDetailResponse)
async def get_lead(
    lead_id: uuid.UUID,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Récupérer un lead avec ses interactions."""
    lead = await service.get_lead(db=db, lead_id=lead_id, user_id=user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    interactions = [
        InteractionResponse(
            id=str(i.id),
            lead_id=str(i.lead_id),
            user_id=str(i.user_id),
            type=i.type,
            subject=i.subject,
            notes=i.notes,
            outcome=i.outcome,
            created_at=i.created_at,
        )
        for i in lead.interactions
    ]

    return LeadDetailResponse(
        id=str(lead.id),
        email=lead.email,
        full_name=lead.full_name,
        company=lead.company,
        phone=lead.phone,
        job_title=lead.job_title,
        status=lead.status,
        source=lead.source,
        score=lead.score,
        notes=lead.notes,
        assigned_to=str(lead.assigned_to) if lead.assigned_to else None,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
        interactions=interactions,
    )


@router.patch("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    body: LeadUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mettre à jour un lead."""
    lead = await service.update_lead(
        db=db,
        lead_id=lead_id,
        user_id=user.id,
        update_data=body.model_dump(exclude_unset=True),
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    await db.commit()
    return LeadResponse(
        id=str(lead.id),
        email=lead.email,
        full_name=lead.full_name,
        company=lead.company,
        phone=lead.phone,
        job_title=lead.job_title,
        status=lead.status,
        source=lead.source,
        score=lead.score,
        notes=lead.notes,
        assigned_to=str(lead.assigned_to) if lead.assigned_to else None,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


@router.post("/leads/{lead_id}/interactions", response_model=InteractionResponse, status_code=201)
async def add_interaction(
    lead_id: uuid.UUID,
    body: InteractionCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Ajouter une interaction avec un lead."""
    # Verify lead exists and user has access
    lead = await service.get_lead(db=db, lead_id=lead_id, user_id=user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    interaction = await service.add_interaction(
        db=db,
        lead_id=lead_id,
        user_id=user.id,
        interaction_data=body.model_dump(),
    )
    await db.commit()

    return InteractionResponse(
        id=str(interaction.id),
        lead_id=str(interaction.lead_id),
        user_id=str(interaction.user_id),
        type=interaction.type,
        subject=interaction.subject,
        notes=interaction.notes,
        outcome=interaction.outcome,
        created_at=interaction.created_at,
    )
