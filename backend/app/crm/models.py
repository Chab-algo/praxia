import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


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


class Lead(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leads"

    # Organization (optional, can be user-scoped)
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )

    # Contact information
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    company: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    job_title: Mapped[str | None] = mapped_column(String(255))

    # Status and tracking
    status: Mapped[LeadStatus] = mapped_column(
        SQLEnum(LeadStatus), default=LeadStatus.NEW, server_default=text("'new'")
    )
    source: Mapped[str | None] = mapped_column(String(100))  # website, referral, etc.
    score: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text)
    extra_data: Mapped[dict] = mapped_column(JSONB, default=dict, server_default=text("'{}'::jsonb"))

    # Assignment
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )

    # Relationships
    interactions: Mapped[list["LeadInteraction"]] = relationship(
        back_populates="lead", cascade="all, delete-orphan", order_by="LeadInteraction.created_at.desc()"
    )


class LeadInteraction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "lead_interactions"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    type: Mapped[InteractionType] = mapped_column(
        SQLEnum(InteractionType), nullable=False
    )
    subject: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(String(100))

    # Relationships
    lead: Mapped["Lead"] = relationship(back_populates="interactions")


class Opportunity(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "opportunities"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id"), nullable=False, index=True
    )
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )

    # Opportunity details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value_cents: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    probability: Mapped[int] = mapped_column(Integer, default=50, server_default=text("50"))  # 0-100
    expected_close_date: Mapped[datetime | None] = mapped_column()

    # Status
    status: Mapped[str] = mapped_column(
        String(50), default="open", server_default=text("'open'")
    )  # open, won, lost

    # Metadata
    notes: Mapped[str | None] = mapped_column(Text)
    extra_data: Mapped[dict] = mapped_column(JSONB, default=dict, server_default=text("'{}'::jsonb"))
