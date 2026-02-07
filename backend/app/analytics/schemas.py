from pydantic import BaseModel


class OverviewResponse(BaseModel):
    total_executions: int
    successful_executions: int
    failed_executions: int
    success_rate: float
    total_cost_cents: float
    total_input_tokens: int
    total_output_tokens: int
    total_cache_hits: int
    avg_duration_ms: int
    avg_cost_cents: float


class AgentStatsItem(BaseModel):
    agent_id: str
    agent_name: str
    recipe_slug: str | None
    agent_status: str
    execution_count: int
    successful_executions: int
    success_rate: float
    total_cost_cents: float
    avg_cost_cents: float
    avg_duration_ms: int
    cache_hits: int


class TimelineItem(BaseModel):
    date: str
    executions: int
    successful: int
    failed: int
    cost_cents: float
    input_tokens: int
    output_tokens: int
