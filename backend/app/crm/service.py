import uuid
from typing import Optional

import structlog
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.crm.models import Lead, LeadInteraction, LeadStatus, InteractionType

logger = structlog.get_logger()


async def create_lead(
    db: AsyncSession,
    user_id: uuid.UUID,
    lead_data: dict,
) -> Lead:
    """Créer un nouveau lead."""
    # Calculate initial score
    score = _calculate_lead_score(lead_data)

    lead = Lead(
        organization_id=None,  # No longer using org-based multi-tenancy
        email=lead_data["email"],
        full_name=lead_data.get("full_name"),
        company=lead_data.get("company"),
        phone=lead_data.get("phone"),
        job_title=lead_data.get("job_title"),
        source=lead_data.get("source"),
        notes=lead_data.get("notes"),
        score=score,
        assigned_to=user_id,  # Assign to creator by default
    )

    db.add(lead)
    await db.flush()

    logger.info("lead_created", lead_id=str(lead.id), email=lead.email, score=score)
    
    # Trigger workflow automation
    try:
        from app.workflows.automations import BusinessWorkflow
        workflow = BusinessWorkflow(db)
        await workflow.on_lead_created(lead.id)
    except Exception as e:
        logger.warning("workflow_trigger_failed", error=str(e))
        # Don't fail lead creation if workflow fails

    return lead


async def list_leads(
    db: AsyncSession,
    user_id: uuid.UUID,
    status: Optional[str] = None,
) -> list[Lead]:
    """Lister les leads."""
    # User-scoped: all leads assigned to user
    query = select(Lead).where(Lead.assigned_to == user_id)

    # Filter by status
    if status:
        try:
            status_enum = LeadStatus(status)
            query = query.where(Lead.status == status_enum)
        except ValueError:
            pass  # Invalid status, ignore filter

    result = await db.execute(query.order_by(Lead.created_at.desc()))
    return list(result.scalars().all())


async def get_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Lead | None:
    """Récupérer un lead par ID."""
    lead = await db.scalar(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.assigned_to == user_id,
        )
    )
    return lead


async def update_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
    update_data: dict,
) -> Lead | None:
    """Mettre à jour un lead."""
    lead = await get_lead(db, lead_id, user_id)
    if not lead:
        return None

    # Update fields
    if "email" in update_data:
        lead.email = update_data["email"]
    if "full_name" in update_data:
        lead.full_name = update_data["full_name"]
    if "company" in update_data:
        lead.company = update_data["company"]
    if "phone" in update_data:
        lead.phone = update_data["phone"]
    if "job_title" in update_data:
        lead.job_title = update_data["job_title"]
    if "status" in update_data:
        lead.status = LeadStatus(update_data["status"])
    if "source" in update_data:
        lead.source = update_data["source"]
    if "notes" in update_data:
        lead.notes = update_data["notes"]
    if "assigned_to" in update_data:
        lead.assigned_to = update_data["assigned_to"]

    # Recalculate score if relevant fields changed
    if any(k in update_data for k in ["email", "company", "job_title"]):
        lead.score = _calculate_lead_score({
            "email": lead.email,
            "company": lead.company,
            "job_title": lead.job_title,
        })

    await db.flush()
    logger.info("lead_updated", lead_id=str(lead.id))
    return lead


async def add_interaction(
    db: AsyncSession,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
    interaction_data: dict,
) -> LeadInteraction:
    """Ajouter une interaction avec un lead."""
    interaction = LeadInteraction(
        lead_id=lead_id,
        user_id=user_id,
        type=InteractionType(interaction_data["type"]),
        subject=interaction_data.get("subject"),
        notes=interaction_data.get("notes"),
        outcome=interaction_data.get("outcome"),
    )

    db.add(interaction)
    await db.flush()

    logger.info(
        "interaction_created",
        interaction_id=str(interaction.id),
        lead_id=str(lead_id),
        type=interaction.type.value,
    )
    return interaction


def _calculate_lead_score(lead_data: dict) -> int:
    """Calcule un score pour un lead (0-100)."""
    score = 0

    # Email domain (enterprise domains score higher)
    email = lead_data.get("email", "")
    if email:
        domain = email.split("@")[-1] if "@" in email else ""
        if domain:
            # Simple heuristic: common enterprise domains
            enterprise_domains = ["gmail.com", "yahoo.com", "hotmail.com"]
            if domain not in enterprise_domains:
                score += 20
            else:
                score += 5

    # Company name
    if lead_data.get("company"):
        score += 30

    # Job title (executive/manager roles score higher)
    job_title = (lead_data.get("job_title") or "").lower()
    if any(keyword in job_title for keyword in ["ceo", "cto", "director", "manager", "head"]):
        score += 30
    elif job_title:
        score += 10

    # Phone number
    if lead_data.get("phone"):
        score += 10

    return min(score, 100)  # Cap at 100
