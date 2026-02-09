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
) -> Recipe:
    """
    Crée une recipe personnalisée dans la base de données.

    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur créateur
        recipe_dict: Dictionnaire de la recipe (format YAML parsé)

    Returns:
        Recipe: Recipe créée
    """
    # Extract config (full recipe) and metadata
    slug = recipe_dict.get("slug")
    if not slug:
        raise ValueError("Le slug est requis")

    # Check if slug already exists for this user
    existing = await db.scalar(
        select(Recipe).where(Recipe.slug == slug, Recipe.created_by == user_id)
    )
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
        organization_id=None,  # No longer using org-based multi-tenancy
    )

    db.add(recipe)
    await db.flush()

    logger.info("custom_recipe_created", recipe_id=str(recipe.id), slug=slug, user_id=str(user_id))
    return recipe


async def list_custom_recipes(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[Recipe]:
    """
    Liste les recipes personnalisées d'un utilisateur.

    Args:
        db: Session de base de données
        user_id: ID de l'utilisateur

    Returns:
        list[Recipe]: Liste des recipes
    """
    query = select(Recipe).where(
        Recipe.is_custom == True,
        Recipe.created_by == user_id
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


async def get_custom_recipe_by_slug(
    db: AsyncSession,
    slug: str,
    user_id: uuid.UUID | None = None,
) -> Recipe | None:
    """
    Récupère une recipe personnalisée par slug.

    Args:
        db: Session de base de données
        slug: Slug de la recipe
        user_id: ID de l'utilisateur (optionnel, pour vérifier l'accès)

    Returns:
        Recipe | None: Recipe trouvée ou None
    """
    query = select(Recipe).where(Recipe.slug == slug, Recipe.is_custom == True)
    
    if user_id:
        # If user_id provided, only return recipes created by that user
        query = query.where(Recipe.created_by == user_id)
    
    recipe = await db.scalar(query)
    return recipe
