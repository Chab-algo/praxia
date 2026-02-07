import uuid
from typing import Optional

import structlog
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.models import Agent
from app.executions.models import Execution
from app.recipes import registry

logger = structlog.get_logger()


async def get_recipe_recommendations(
    db: AsyncSession,
    user_id: uuid.UUID,
    domain: Optional[str] = None,
) -> list[dict]:
    """
    Recommande des recipes basées sur l'utilisation de l'utilisateur.

    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur
        domain: Domaine métier pour filtrer (optionnel)

    Returns:
        list[dict]: Liste de recipes recommandées avec score
    """
    # Get user's agents to understand their domain preferences
    agents_result = await db.execute(
        select(Agent).where(Agent.created_by == user_id)
    )
    user_agents = list(agents_result.scalars().all())

    # Analyze most used categories
    category_usage = {}
    for agent in user_agents:
        if agent.recipe_slug:
            recipe = registry.get_recipe(agent.recipe_slug)
            if recipe:
                cat = recipe.get("category", "general")
                category_usage[cat] = category_usage.get(cat, 0) + 1

    # Get all recipes
    all_recipes = registry.list_recipes()

    # Filter by domain if provided
    if domain:
        all_recipes = [r for r in all_recipes if r.get("category") == domain]

    # Score recipes based on:
    # 1. Category match (if user uses this category)
    # 2. Popularity (number of agents using it)
    # 3. Cost efficiency
    recommendations = []
    for recipe in all_recipes:
        score = 0
        recipe_category = recipe.get("category", "general")

        # Category match
        if recipe_category in category_usage:
            score += category_usage[recipe_category] * 10

        # Cost efficiency (lower cost = higher score)
        cost = recipe.get("estimated_cost_per_run", 0.001)
        if cost > 0:
            score += max(0, 50 - (cost * 10000))  # Inverse cost scoring

        # Popularity (if many agents use this recipe)
        # This would require tracking, for now we use a base score
        score += 20

        recommendations.append({
            **recipe,
            "recommendation_score": score,
            "reason": _get_recommendation_reason(recipe_category, category_usage),
        })

    # Sort by score and return top 5
    recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
    return recommendations[:5]


async def get_optimization_recommendations(
    db: AsyncSession,
    agent_id: uuid.UUID,
) -> list[dict]:
    """
    Recommande des optimisations pour un agent basées sur ses résultats d'exécution.

    Args:
        db: Session de base de données
        agent_id: ID de l'agent

    Returns:
        list[dict]: Liste de recommandations d'optimisation
    """
    # Get agent
    agent = await db.get(Agent, agent_id)
    if not agent:
        return []

    # Get execution stats
    executions_result = await db.execute(
        select(
            func.count(Execution.id).label("total"),
            func.count(func.case((Execution.status == "completed", 1))).label("successful"),
            func.avg(Execution.total_cost_cents).label("avg_cost"),
            func.avg(Execution.duration_ms).label("avg_duration"),
        ).where(Execution.agent_id == agent_id)
    )
    stats = executions_result.one()

    recommendations = []

    # Check success rate
    if stats.total and stats.total > 0:
        success_rate = (stats.successful / stats.total) * 100
        if success_rate < 80:
            recommendations.append({
                "type": "success_rate",
                "priority": "high",
                "title": "Améliorer le taux de succès",
                "description": f"Le taux de succès est de {success_rate:.1f}%. Considérez améliorer les prompts système.",
                "action": "Réviser les prompts dans la configuration de l'agent",
            })

    # Check costs
    if stats.avg_cost and stats.avg_cost > 5:  # More than 5 cents per execution
        recommendations.append({
            "type": "cost",
            "priority": "medium",
            "title": "Réduire les coûts",
            "description": f"Le coût moyen est de ${stats.avg_cost/100:.4f} par exécution.",
            "action": "Utiliser des modèles moins coûteux ou optimiser les prompts pour réduire les tokens",
        })

    # Check duration
    if stats.avg_duration and stats.avg_duration > 10000:  # More than 10 seconds
        recommendations.append({
            "type": "performance",
            "priority": "medium",
            "title": "Améliorer les performances",
            "description": f"La durée moyenne est de {stats.avg_duration/1000:.1f}s.",
            "action": "Paralléliser les steps ou utiliser le cache LLM",
        })

    # Check if agent is inactive
    if agent.status != "active":
        recommendations.append({
            "type": "activation",
            "priority": "low",
            "title": "Activer l'agent",
            "description": "L'agent n'est pas actif.",
            "action": "Activer l'agent pour commencer à l'utiliser",
        })

    return recommendations


def _get_recommendation_reason(category: str, category_usage: dict) -> str:
    """Génère une raison pour la recommandation."""
    if category in category_usage:
        return f"Basé sur votre utilisation de recipes {category}"
    return f"Nouvelle catégorie à explorer: {category}"
