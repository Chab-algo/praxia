import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDMixin


class UsageDaily(Base, UUIDMixin):
    __tablename__ = "usage_daily"
    __table_args__ = (
        # Unique constraint on (org, date)
        {"info": {"unique_together": ("organization_id", "date")}},
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)

    # Counters
    total_executions: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    successful_executions: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    failed_executions: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))

    # Tokens
    total_input_tokens: Mapped[int] = mapped_column(BigInteger, default=0, server_default=text("0"))
    total_output_tokens: Mapped[int] = mapped_column(
        BigInteger, default=0, server_default=text("0")
    )

    # Cost
    total_cost_cents: Mapped[Decimal] = mapped_column(
        Numeric(12, 4), default=0, server_default=text("0")
    )

    # Model breakdown
    nano_calls: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    mini_calls: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    full_calls: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    cache_hits: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))


class ApiKey(Base, UUIDMixin):
    __tablename__ = "api_keys"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id"), nullable=False
    )

    key_prefix: Mapped[str] = mapped_column(String(10), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255))

    scopes: Mapped[list] = mapped_column(
        JSONB, default=lambda: ["agent:execute"], server_default=text("'[\"agent:execute\"]'::jsonb")
    )

    last_used_at: Mapped[datetime | None] = mapped_column()
    expires_at: Mapped[datetime | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("TRUE"))

    created_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, server_default=text("NOW()")
    )
