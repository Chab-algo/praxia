import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ExecutionCreate(BaseModel):
    agent_id: str
    input_data: dict


class ExecutionStepResponse(BaseModel):
    step_index: int
    step_name: str
    step_type: str
    model_used: str | None
    input_tokens: int
    output_tokens: int
    cost_cents: float
    cache_hit: bool
    status: str
    duration_ms: int | None
    output_data: dict | None


class ExecutionResponse(BaseModel):
    id: str
    agent_id: str
    status: str
    input_data: dict
    output_data: dict | None
    error_data: dict | None
    total_input_tokens: int
    total_output_tokens: int
    total_cost_cents: float
    cache_hits: int
    models_used: list[str]
    duration_ms: int | None
    triggered_by: str
    created_at: datetime
    steps: list[ExecutionStepResponse] = []

    model_config = ConfigDict(from_attributes=True)
