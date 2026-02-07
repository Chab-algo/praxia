from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from typing import Annotated, Optional

from app.auth.dependencies import get_current_user, get_current_org
from app.auth.models import User
from app.db.engine import get_db
from app.organizations.models import Organization
from app.recipes import registry, service
from app.recipes.builder import RecipeBuilder
from app.recipes.schemas import (
    RecipeCreateRequest,
    RecipeDetail,
    RecipeGenerationRequest,
    RecipeGenerationResponse,
    RecipeListItem,
    RecipeResponse,
    RecipeValidationRequest,
    RecipeValidationResponse,
)

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeListItem])
async def list_recipes():
    return registry.list_recipes()


@router.get("/my", response_model=list[RecipeResponse])
async def list_my_recipes(
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Optional[Organization], Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Liste les recipes personnalisées de l'utilisateur."""
    recipes = await service.list_custom_recipes(
        db=db,
        user_id=user.id,
        organization_id=org.id if org else None,
    )
    return [
        RecipeResponse(
            id=str(r.id),
            slug=r.slug,
            name=r.name,
            description=r.description,
            category=r.category,
            version=r.version,
            is_custom=r.is_custom,
            created_at=r.created_at,
        )
        for r in recipes
    ]


@router.get("/{slug}", response_model=RecipeDetail)
async def get_recipe(slug: str):
    recipe = registry.get_recipe(slug)
    if not recipe:
        raise HTTPException(status_code=404, detail=f"Recipe '{slug}' not found")
    return RecipeDetail(
        slug=recipe["slug"],
        name=recipe["name"],
        description=recipe.get("description", ""),
        category=recipe["category"],
        version=recipe.get("version", "1.0.0"),
        icon=recipe.get("icon"),
        estimated_cost_per_run=recipe.get("estimated_cost_per_run"),
        roi_metrics=recipe.get("roi_metrics", {}),
        input_schema=recipe.get("input_schema", {}),
        output_schema=recipe.get("output_schema", {}),
        steps=recipe.get("steps", []),
    )


@router.post("/builder/generate", response_model=RecipeGenerationResponse)
async def generate_recipe_from_requirement(
    body: RecipeGenerationRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    """Génère une recipe à partir d'un besoin métier décrit en langage naturel."""
    builder = RecipeBuilder()
    try:
        recipe = await builder.generate_from_requirement(
            business_need=body.requirement,
            domain=body.domain,
            examples=body.examples,
        )
        return RecipeGenerationResponse(
            recipe=recipe,
            slug=recipe.get("slug", ""),
            name=recipe.get("name", ""),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")


@router.post("/builder/validate", response_model=RecipeValidationResponse)
async def validate_recipe(
    body: RecipeValidationRequest,
    user: Annotated[User, Depends(get_current_user)],
):
    """Valide une recipe avant de la sauvegarder."""
    builder = RecipeBuilder()
    result = builder.validate_recipe(body.recipe)
    return RecipeValidationResponse(
        valid=result["valid"],
        errors=result["errors"],
        warnings=result["warnings"],
        suggestions=result["suggestions"],
    )


@router.post("", response_model=RecipeResponse, status_code=201)
async def create_custom_recipe(
    body: RecipeCreateRequest,
    user: Annotated[User, Depends(get_current_user)],
    org: Annotated[Optional[Organization], Depends(get_current_org)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Sauvegarde une recipe personnalisée."""
    try:
        recipe = await service.create_custom_recipe(
            db=db,
            user_id=user.id,
            recipe_dict=body.recipe,
            organization_id=org.id if org else None,
        )
        await db.commit()
        return RecipeResponse(
            id=str(recipe.id),
            slug=recipe.slug,
            name=recipe.name,
            description=recipe.description,
            category=recipe.category,
            version=recipe.version,
            is_custom=recipe.is_custom,
            created_at=recipe.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création: {str(e)}")
