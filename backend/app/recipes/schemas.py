from pydantic import BaseModel


class RecipeListItem(BaseModel):
    slug: str
    name: str
    description: str
    category: str
    version: str
    icon: str | None
    estimated_cost_per_run: float | None
    roi_metrics: dict
    input_schema: dict
    output_schema: dict


class RecipeDetail(RecipeListItem):
    steps: list[dict]
