import uuid
from datetime import datetime, timedelta

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.models import Agent
from app.executions.models import Execution
from app.organizations.models import Organization

logger = structlog.get_logger()


async def get_client_overview(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> dict:
    """
    Récupère une vue complète d'un client (organisation).

    Returns:
        dict: Vue complète avec agents, utilisations, métriques, score de santé
    """
    # Get organization
    org = await db.get(Organization, client_id)
    if not org:
        return None

    # Get agents
    agents_result = await db.execute(
        select(Agent).where(Agent.organization_id == client_id)
    )
    agents = list(agents_result.scalars().all())

    # Get executions stats
    executions_result = await db.execute(
        select(
            func.count(Execution.id).label("total"),
            func.count(func.case((Execution.status == "completed", 1))).label("successful"),
            func.sum(Execution.total_cost_cents).label("total_cost_cents"),
            func.max(Execution.created_at).label("last_execution_at"),
        ).where(Execution.organization_id == client_id)
    )
    exec_stats = executions_result.one()

    # Calculate health score
    health_score = await calculate_client_health_score(
        db=db,
        org=org,
        agents=agents,
        exec_stats=exec_stats,
    )

    return {
        "organization": {
            "id": str(org.id),
            "name": org.name,
            "plan": org.plan,
            "created_at": org.created_at,
        },
        "agents": [
            {
                "id": str(a.id),
                "name": a.name,
                "status": a.status,
                "recipe_slug": a.recipe_slug,
                "created_at": a.created_at,
            }
            for a in agents
        ],
        "executions": {
            "total": exec_stats.total or 0,
            "successful": exec_stats.successful or 0,
            "success_rate": (
                (exec_stats.successful / exec_stats.total * 100)
                if exec_stats.total and exec_stats.total > 0
                else 0
            ),
            "total_cost_cents": float(exec_stats.total_cost_cents or 0),
            "last_execution_at": exec_stats.last_execution_at,
        },
        "health_score": health_score,
    }


async def calculate_client_health_score(
    db: AsyncSession,
    org: Organization,
    agents: list[Agent],
    exec_stats: any,
) -> dict:
    """
    Calcule un score de santé pour un client (0-100).

    Factors:
    - Adoption: nombre d'agents créés
    - Usage: fréquence d'utilisation
    - Success rate: taux de succès des exécutions
    - Engagement: dernière utilisation
    - Budget: utilisation du budget
    """
    factors = {}

    # Adoption (0-30 points)
    agent_count = len(agents)
    active_agents = len([a for a in agents if a.status == "active"])
    adoption_score = min(30, (agent_count * 5) + (active_agents * 10))
    factors["adoption"] = adoption_score

    # Usage (0-25 points)
    total_executions = exec_stats.total or 0
    if total_executions == 0:
        usage_score = 0
    elif total_executions < 10:
        usage_score = 5
    elif total_executions < 50:
        usage_score = 15
    elif total_executions < 100:
        usage_score = 20
    else:
        usage_score = 25
    factors["usage"] = usage_score

    # Success rate (0-25 points)
    success_rate = (
        (exec_stats.successful / exec_stats.total * 100)
        if exec_stats.total and exec_stats.total > 0
        else 0
    )
    success_score = min(25, (success_rate / 100) * 25)
    factors["success_rate"] = success_score

    # Engagement (0-20 points)
    last_execution = exec_stats.last_execution_at
    days_since = None
    if not last_execution:
        engagement_score = 0
    else:
        days_since = (datetime.utcnow() - last_execution).days
        if days_since <= 1:
            engagement_score = 20
        elif days_since <= 7:
            engagement_score = 15
        elif days_since <= 30:
            engagement_score = 10
        else:
            engagement_score = 5
    factors["engagement"] = engagement_score

    # Total score
    total_score = sum(factors.values())
    factors["total"] = total_score

    # Recommendations
    recommendations = []
    if agent_count == 0:
        recommendations.append("Créer votre premier agent pour commencer")
    elif active_agents == 0:
        recommendations.append("Activer vos agents pour les utiliser")
    if total_executions == 0:
        recommendations.append("Tester vos agents pour voir leur fonctionnement")
    if success_rate < 70 and total_executions > 0:
        recommendations.append("Optimiser vos prompts pour améliorer le taux de succès")
    if days_since is None or (days_since and days_since > 30):
        recommendations.append("Utiliser régulièrement vos agents pour maximiser la valeur")

    return {
        "score": total_score,
        "factors": factors,
        "recommendations": recommendations,
    }
