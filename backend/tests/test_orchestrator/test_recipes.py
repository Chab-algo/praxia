from app.recipes.registry import get_recipe, list_recipes, load_recipes


def test_load_recipes():
    recipes = load_recipes()
    assert len(recipes) >= 3
    assert "review-responder" in recipes
    assert "cv-screener" in recipes
    assert "invoice-analyzer" in recipes


def test_get_recipe():
    recipe = get_recipe("review-responder")
    assert recipe is not None
    assert recipe["name"] == "Review Responder"
    assert recipe["category"] == "ecommerce"
    assert "steps" in recipe
    assert len(recipe["steps"]) == 3


def test_list_recipes_metadata():
    items = list_recipes()
    assert len(items) >= 3
    for item in items:
        assert "slug" in item
        assert "name" in item
        assert "category" in item
        # Full config should NOT be in the list
        assert "steps" not in item


def test_recipe_not_found():
    recipe = get_recipe("nonexistent")
    assert recipe is None
