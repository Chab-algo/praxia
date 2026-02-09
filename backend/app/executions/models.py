import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDMixin


class Execution(Base, UUIDMixin):
    __tablename__ = "executions"

    agent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agents.id"), nullable=False, index=True)
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default=text("'pending'")
    )

    # Input/Output
    input_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    output_data: Mapped[dict | None] = mapped_column(JSONB)
    error_data: Mapped[dict | None] = mapped_column(JSONB)

    # Performance
    started_at: Mapped[datetime | None] = mapped_column()
    completed_at: Mapped[datetime | None] = mapped_column()
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    # Cost tracking
    total_input_tokens: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    total_output_tokens: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    total_cost_cents: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), default=0, server_default=text("0")
    )
    models_used: Mapped[list] = mapped_column(JSONB, default=list, server_default=text("'[]'::jsonb"))
    cache_hits: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))

    triggered_by: Mapped[str] = mapped_column(
        String(50), default="api", server_default=text("'api'")
    )
    triggered_by_user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, server_default=text("NOW()")
    )

    # Relationships
    steps: Mapped[list["ExecutionStep"]] = relationship(
        back_populates="execution", cascade="all, delete-orphan"
    )
    agent: Mapped["Agent"] = relationship(lazy="joined", foreign_keys="[Execution.agent_id]")


class ExecutionStep(Base, UUIDMixin):
    __tablename__ = "execution_steps"

    execution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("executions.id", ondelete="CASCADE"), nullable=False, index=True
    )

    step_index: Mapped[int] = mapped_column(Integer, nullable=False)
    step_name: Mapped[str] = mapped_column(String(255), nullable=False)
    step_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # LLM specifics
    model_used: Mapped[str | None] = mapped_column(String(100))
    prompt_hash: Mapped[str | None] = mapped_column(String(64))
    input_tokens: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    output_tokens: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    cost_cents: Mapped[Decimal] = mapped_column(
        Numeric(10, 6), default=0, server_default=text("0")
    )
    cache_hit: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("FALSE"))

    # Data
    input_data: Mapped[dict | None] = mapped_column(JSONB)
    output_data: Mapped[dict | None] = mapped_column(JSONB)
    error_data: Mapped[dict | None] = mapped_column(JSONB)

    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default=text("'pending'")
    )
    started_at: Mapped[datetime | None] = mapped_column()
    completed_at: Mapped[datetime | None] = mapped_column()
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    # Relationships
    execution: Mapped["Execution"] = relationship(back_populates="steps")
