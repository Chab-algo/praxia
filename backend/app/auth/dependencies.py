from typing import Annotated

import structlog
from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware import verify_clerk_token
from app.auth.models import User
from app.db.engine import get_db
from app.organizations.models import Organization

logger = structlog.get_logger()


async def get_current_user(
    payload: Annotated[dict, Depends(verify_clerk_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get or create user from Clerk JWT payload."""
    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    user = await db.scalar(select(User).where(User.clerk_user_id == clerk_user_id))

    if not user:
        # Auto-create user on first API call (webhook may not have fired yet)
        user = User(
            clerk_user_id=clerk_user_id,
            email=payload.get("email", f"{clerk_user_id}@clerk.dev"),
            full_name=payload.get("name"),
        )
        db.add(user)
        await db.flush()
        logger.info("user_auto_created", clerk_user_id=clerk_user_id)

    return user


async def get_current_org(
    payload: Annotated[dict, Depends(verify_clerk_token)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Organization:
    """Get the current organization from Clerk JWT org claim."""
    clerk_org_id = payload.get("org_id")
    if not clerk_org_id:
        raise HTTPException(status_code=403, detail="Organization context required")

    org = await db.scalar(
        select(Organization).where(
            Organization.clerk_org_id == clerk_org_id,
            Organization.deleted_at.is_(None),
        )
    )

    if not org:
        # Auto-create org on first API call
        org = Organization(
            clerk_org_id=clerk_org_id,
            name=payload.get("org_name", "My Organization"),
            slug=clerk_org_id.lower().replace("org_", ""),
        )
        db.add(org)
        await db.flush()
        logger.info("org_auto_created", clerk_org_id=clerk_org_id)

    return org
