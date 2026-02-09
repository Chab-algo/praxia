import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class BatchExecution(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "batch_executions"

    agent_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agents.id"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default=text("'pending'")
    )
    file_type: Mapped[str] = mapped_column(
        String(20), default="csv", server_default=text("'csv'")
    )
    total_items: Mapped[int] = mapped_column(Integer, nullable=False)
    completed_items: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0")
    )
    failed_items: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0")
    )
    total_cost_cents: Mapped[Decimal] = mapped_column(
        Numeric(10, 4), default=0, server_default=text("0")
    )
    completed_at: Mapped[datetime | None] = mapped_column()

    # Relationships
    items: Mapped[list["BatchItem"]] = relationship(
        back_populates="batch", cascade="all, delete-orphan"
    )
    agent: Mapped["Agent"] = relationship(  # noqa: F821
        lazy="joined", foreign_keys="[BatchExecution.agent_id]"
    )


class BatchItem(Base, UUIDMixin):
    __tablename__ = "batch_items"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("batch_executions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_index: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default=text("'pending'")
    )
    input_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    output_data: Mapped[dict | None] = mapped_column(JSONB)
    error_data: Mapped[dict | None] = mapped_column(JSONB)
    execution_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("executions.id"), nullable=True
    )
    cost_cents: Mapped[Decimal] = mapped_column(
        Numeric(10, 6), default=0, server_default=text("0")
    )
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, server_default=text("NOW()")
    )
    completed_at: Mapped[datetime | None] = mapped_column()

    # Relationships
    batch: Mapped["BatchExecution"] = relationship(back_populates="items")
