from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BatchCreate(BaseModel):
    agent_id: str
    name: str
    items: list[dict]
    file_type: str = "csv"


class BatchItemResponse(BaseModel):
    id: str
    item_index: int
    status: str
    input_data: dict
    output_data: dict | None
    error_data: dict | None
    cost_cents: float
    duration_ms: int | None
    created_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class BatchResponse(BaseModel):
    id: str
    agent_id: str
    recipe_slug: str | None = None
    name: str
    status: str
    file_type: str
    total_items: int
    completed_items: int
    failed_items: int
    total_cost_cents: float
    created_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class BatchDetailResponse(BatchResponse):
    items: list[BatchItemResponse]
