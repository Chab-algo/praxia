from datetime import datetime

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


class RecipeGenerationRequest(BaseModel):
    requirement: str
    domain: str = "general"
    examples: list[dict] | None = None


class RecipeGenerationResponse(BaseModel):
    recipe: dict
    slug: str
    name: str


class RecipeValidationRequest(BaseModel):
    recipe: dict


class RecipeValidationResponse(BaseModel):
    valid: bool
    errors: list[str]
    warnings: list[str]
    suggestions: list[str]


class RecipeCreateRequest(BaseModel):
    recipe: dict


class RecipeResponse(BaseModel):
    id: str
    slug: str
    name: str
    description: str | None
    category: str
    version: str
    is_custom: bool
    created_at: datetime
