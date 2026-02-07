import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Organization(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organizations"

    clerk_org_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="trial", server_default=text("'trial'"))
    settings: Mapped[dict] = mapped_column(JSONB, default=dict, server_default=text("'{}'::jsonb"))

    # Budget tracking
    monthly_budget_cents: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"))
    current_month_usage_cents: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0")
    )

    # Soft delete
    deleted_at: Mapped[datetime | None] = mapped_column()

    # Relationships
    members: Mapped[list["OrganizationMember"]] = relationship(back_populates="organization")


class OrganizationMember(Base, UUIDMixin):
    __tablename__ = "organization_members"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), default="member", server_default=text("'member'")
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, server_default=text("NOW()")
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(back_populates="members")
