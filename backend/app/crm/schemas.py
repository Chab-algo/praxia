import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"


class InteractionType(str, Enum):
    EMAIL = "email"
    CALL = "call"
    MEETING = "meeting"
    DEMO = "demo"
    NOTE = "note"


class LeadCreate(BaseModel):
    email: str
    full_name: str | None = None
    company: str | None = None
    phone: str | None = None
    job_title: str | None = None
    source: str | None = None
    notes: str | None = None


class LeadUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    company: str | None = None
    phone: str | None = None
    job_title: str | None = None
    status: LeadStatus | None = None
    source: str | None = None
    score: int | None = None
    notes: str | None = None
    assigned_to: uuid.UUID | None = None


class LeadResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    company: str | None
    phone: str | None
    job_title: str | None
    status: LeadStatus
    source: str | None
    score: int
    notes: str | None
    assigned_to: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InteractionCreate(BaseModel):
    type: InteractionType
    subject: str | None = None
    notes: str | None = None
    outcome: str | None = None


class InteractionResponse(BaseModel):
    id: str
    lead_id: str
    user_id: str
    type: InteractionType
    subject: str | None
    notes: str | None
    outcome: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadDetailResponse(LeadResponse):
    interactions: list[InteractionResponse]
