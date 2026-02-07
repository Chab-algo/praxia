from fastapi import APIRouter, HTTPException

from app.recipes import registry
from app.recipes.schemas import RecipeDetail, RecipeListItem

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeListItem])
async def list_recipes():
    return registry.list_recipes()


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
