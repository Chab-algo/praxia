import uuid
from datetime import datetime, timedelta

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crm.models import Lead, LeadStatus
from app.organizations.models import Organization

logger = structlog.get_logger()


class BusinessWorkflow:
    """Automatise le cycle de vente et la gestion clients."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def on_lead_created(self, lead_id: uuid.UUID) -> None:
        """Quand un lead est créé."""
        lead = await self.db.get(Lead, lead_id)
        if not lead:
            return

        logger.info("workflow_lead_created", lead_id=str(lead_id), email=lead.email)

        # TODO: Send welcome email
        # TODO: Assign to sales rep based on rules
        # TODO: Create follow-up task

        # Auto-qualify high-score leads
        if lead.score >= 70:
            lead.status = LeadStatus.QUALIFIED
            await self.db.flush()
            logger.info("lead_auto_qualified", lead_id=str(lead_id), score=lead.score)

    async def on_client_onboarded(self, org_id: uuid.UUID) -> None:
        """Quand un client termine l'onboarding."""
        org = await self.db.get(Organization, org_id)
        if not org:
            return

        logger.info("workflow_client_onboarded", org_id=str(org_id), name=org.name)

        # TODO: Send welcome resources email
        # TODO: Schedule check-in in 7 days
        # TODO: Create demo agent

    async def check_client_health(self, org_id: uuid.UUID) -> dict:
        """Vérifie la santé d'un client et déclenche des actions si nécessaire."""
        from app.clients import service

        overview = await service.get_client_overview(self.db, org_id)
        if not overview:
            return {}

        health_score = overview.get("health_score", {})
        score = health_score.get("score", 0)

        logger.info("workflow_client_health_check", org_id=str(org_id), score=score)

        actions_taken = []

        if score < 50:
            # Low health - alert team
            actions_taken.append("alert_sent")
            # TODO: Send alert to team
            # TODO: Send email to client with support offer
            # TODO: Create task for account manager

        if score < 30:
            # Critical - immediate action
            actions_taken.append("critical_alert")
            # TODO: Escalate to manager
            # TODO: Schedule urgent call

        return {
            "score": score,
            "actions_taken": actions_taken,
        }

    async def check_inactive_leads(self, days: int = 30) -> list[uuid.UUID]:
        """Trouve les leads inactifs et crée des rappels."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        result = await self.db.execute(
            select(Lead).where(
                Lead.status.in_([LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED]),
                Lead.updated_at < cutoff_date,
            )
        )
        inactive_leads = list(result.scalars().all())

        logger.info("workflow_inactive_leads_found", count=len(inactive_leads))

        # TODO: Send reminder emails
        # TODO: Create follow-up tasks

        return [lead.id for lead in inactive_leads]

    async def check_upcoming_renewals(self, days_ahead: int = 30) -> list[uuid.UUID]:
        """Trouve les clients avec renouvellements à venir."""
        # TODO: Implement when subscription/renewal system is added
        return []
