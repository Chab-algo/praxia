import uuid
from decimal import Decimal

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.recipes.models import Recipe

logger = structlog.get_logger()


async def create_custom_recipe(
    db: AsyncSession,
    user_id: uuid.UUID,
    recipe_dict: dict,
    organization_id: uuid.UUID | None = None,
) -> Recipe:
    """
    Crée une recipe personnalisée dans la base de données.

    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur créateur
        recipe_dict: Dictionnaire de la recipe (format YAML parsé)
        organization_id: ID de l'organisation (optionnel)

    Returns:
        Recipe: Recipe créée
    """
    # Extract config (full recipe) and metadata
    slug = recipe_dict.get("slug")
    if not slug:
        raise ValueError("Le slug est requis")

    # Check if slug already exists
    existing = await db.scalar(select(Recipe).where(Recipe.slug == slug))
    if existing:
        raise ValueError(f"Une recipe avec le slug '{slug}' existe déjà")

    # Create recipe
    recipe = Recipe(
        slug=slug,
        name=recipe_dict.get("name", ""),
        description=recipe_dict.get("description"),
        category=recipe_dict.get("category", "general"),
        version=recipe_dict.get("version", "1.0.0"),
        config=recipe_dict,  # Full recipe as config
        is_public=False,  # Custom recipes are private by default
        is_custom=True,
        icon=recipe_dict.get("icon"),
        estimated_cost_per_run=Decimal(str(recipe_dict.get("estimated_cost_per_run", 0)))
        if recipe_dict.get("estimated_cost_per_run")
        else None,
        created_by=user_id,
        organization_id=organization_id,
    )

    db.add(recipe)
    await db.flush()

    logger.info("custom_recipe_created", recipe_id=str(recipe.id), slug=slug, user_id=str(user_id))
    return recipe


async def list_custom_recipes(
    db: AsyncSession,
    user_id: uuid.UUID,
    organization_id: uuid.UUID | None = None,
) -> list[Recipe]:
    """
    Liste les recipes personnalisées d'un utilisateur ou d'une organisation.

    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur
        organization_id: ID de l'organisation (optionnel, pour filtrer)

    Returns:
        list[Recipe]: Liste des recipes
    """
    from sqlalchemy import or_
    
    query = select(Recipe).where(Recipe.is_custom == True, Recipe.created_by == user_id)

    # If organization_id is provided, include recipes with that org_id OR no org_id (user-scoped)
    # If organization_id is None, return all user's recipes regardless of org_id
    if organization_id:
        query = query.where(
            or_(
                Recipe.organization_id == organization_id,
                Recipe.organization_id.is_(None)
            )
        )

    result = await db.execute(query.order_by(Recipe.created_at.desc()))
    return list(result.scalars().all())


async def get_custom_recipe(
    db: AsyncSession,
    recipe_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Recipe | None:
    """
    Récupère une recipe personnalisée par ID.

    Args:
        db: Session de base de données
        recipe_id: ID de la recipe
        user_id: ID de l'utilisateur (pour vérifier l'accès)

    Returns:
        Recipe | None: Recipe trouvée ou None
    """
    recipe = await db.scalar(
        select(Recipe).where(Recipe.id == recipe_id, Recipe.created_by == user_id)
    )
    return recipe
