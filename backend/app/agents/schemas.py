import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AgentCreate(BaseModel):
    name: str
    description: str | None = None
    recipe_slug: str
    config_overrides: dict = {}
    custom_prompts: dict = {}


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    config_overrides: dict | None = None
    custom_prompts: dict | None = None
    webhook_url: str | None = None


class AgentResponse(BaseModel):
    id: str
    name: str
    description: str | None
    status: str
    recipe_slug: str | None
    config_overrides: dict
    custom_prompts: dict
    webhook_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
