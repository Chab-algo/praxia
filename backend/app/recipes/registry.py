from pathlib import Path

import structlog
import yaml

logger = structlog.get_logger()

TEMPLATES_DIR = Path(__file__).parent / "templates"

_recipe_cache: dict[str, dict] = {}


def load_recipes() -> dict[str, dict]:
    """Load all recipe YAML files from the templates directory."""
    global _recipe_cache

    if _recipe_cache:
        return _recipe_cache

    for yml_file in TEMPLATES_DIR.glob("*.yml"):
        try:
            with open(yml_file) as f:
                recipe = yaml.safe_load(f)
            slug = recipe.get("slug")
            if slug:
                _recipe_cache[slug] = recipe
                logger.info("recipe_loaded", slug=slug, file=yml_file.name)
        except Exception as e:
            logger.error("recipe_load_failed", file=yml_file.name, error=str(e))

    return _recipe_cache


def get_recipe(slug: str) -> dict | None:
    """Get a specific recipe by slug."""
    recipes = load_recipes()
    return recipes.get(slug)


def list_recipes() -> list[dict]:
    """List all available recipes with metadata (without full config)."""
    recipes = load_recipes()
    return [
        {
            "slug": r["slug"],
            "name": r["name"],
            "description": r.get("description", ""),
            "category": r["category"],
            "version": r.get("version", "1.0.0"),
            "icon": r.get("icon"),
            "estimated_cost_per_run": r.get("estimated_cost_per_run"),
            "roi_metrics": r.get("roi_metrics", {}),
            "input_schema": r.get("input_schema", {}),
            "output_schema": r.get("output_schema", {}),
        }
        for r in recipes.values()
    ]
