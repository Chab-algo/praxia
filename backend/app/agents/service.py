import uuid

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.models import Agent
from app.recipes import registry
from app.recipes import service as recipe_service
from app.recipes.models import Recipe

logger = structlog.get_logger()


async def create_agent(
    db: AsyncSession,
    user_id: uuid.UUID,
    name: str,
    recipe_slug: str,
    description: str | None = None,
    config_overrides: dict | None = None,
    custom_prompts: dict | None = None,
) -> Agent:
    # First try to get from registry (public recipes)
    recipe = registry.get_recipe(recipe_slug)
    
    # If not found in registry, try database (custom recipes)
    if not recipe:
        recipe_db = await recipe_service.get_custom_recipe_by_slug(
            db=db,
            slug=recipe_slug,
            user_id=user_id,
        )
        if recipe_db:
            # Convert database recipe to dict format
            recipe = recipe_db.config
        else:
            raise ValueError(f"Recipe '{recipe_slug}' not found")

    agent = Agent(
        recipe_slug=recipe_slug,
        name=name,
        description=description or recipe.get("description"),
        status="draft",
        config_overrides=config_overrides or {},
        custom_prompts=custom_prompts or {},
        created_by=user_id,
    )
    db.add(agent)
    await db.flush()

    logger.info("agent_created", agent_id=str(agent.id), recipe=recipe_slug)
    return agent


async def list_agents(db: AsyncSession, user_id: uuid.UUID) -> list[Agent]:
    result = await db.scalars(
        select(Agent)
        .where(Agent.created_by == user_id, Agent.deleted_at.is_(None))
        .order_by(Agent.created_at.desc())
    )
    return list(result.all())


async def get_agent(db: AsyncSession, agent_id: uuid.UUID, user_id: uuid.UUID) -> Agent | None:
    return await db.scalar(
        select(Agent).where(
            Agent.id == agent_id,
            Agent.created_by == user_id,
            Agent.deleted_at.is_(None),
        )
    )


async def update_agent(
    db: AsyncSession,
    agent: Agent,
    **updates,
) -> Agent:
    for key, value in updates.items():
        if value is not None:
            setattr(agent, key, value)
    await db.flush()
    return agent
