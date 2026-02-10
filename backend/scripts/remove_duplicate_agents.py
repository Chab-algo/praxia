"""
Script to remove duplicate agents from the database.

Usage:
    python -m scripts.remove_duplicate_agents [--dry-run]
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.engine import async_engine
from app.agents.models import Agent


async def find_duplicates(db: AsyncSession):
    """Find duplicate agents (same name + recipe_slug + created_by)."""

    # Query to find duplicates
    stmt = (
        select(
            Agent.name,
            Agent.recipe_slug,
            Agent.created_by,
            func.count(Agent.id).label("count"),
            func.array_agg(Agent.id).label("ids"),
            func.array_agg(Agent.created_at).label("created_ats"),
        )
        .where(Agent.deleted_at.is_(None))
        .group_by(Agent.name, Agent.recipe_slug, Agent.created_by)
        .having(func.count(Agent.id) > 1)
    )

    result = await db.execute(stmt)
    duplicates = result.all()

    return duplicates


async def remove_duplicates(dry_run: bool = True):
    """Remove duplicate agents, keeping the oldest one."""

    async with AsyncSession(async_engine) as db:
        duplicates = await find_duplicates(db)

        if not duplicates:
            print("✅ No duplicate agents found!")
            return

        print(f"Found {len(duplicates)} sets of duplicate agents:\n")

        total_to_delete = 0

        for dup in duplicates:
            name, recipe_slug, created_by, count, ids, created_ats = dup

            # Sort by created_at to keep the oldest
            sorted_agents = sorted(zip(ids, created_ats), key=lambda x: x[1])
            keep_id = sorted_agents[0][0]  # Keep oldest
            delete_ids = [aid for aid, _ in sorted_agents[1:]]

            print(f"📦 {name} ({recipe_slug})")
            print(f"   User: {created_by}")
            print(f"   Total: {count} duplicates")
            print(f"   ✅ Keep: {keep_id} (created {sorted_agents[0][1]})")
            print(f"   ❌ Delete: {len(delete_ids)} agents")
            for aid, created_at in sorted_agents[1:]:
                print(f"      - {aid} (created {created_at})")
            print()

            total_to_delete += len(delete_ids)

            if not dry_run:
                # Soft delete duplicates
                stmt = (
                    select(Agent)
                    .where(
                        and_(
                            Agent.id.in_(delete_ids),
                            Agent.deleted_at.is_(None)
                        )
                    )
                )
                agents_to_delete = await db.scalars(stmt)

                for agent in agents_to_delete.all():
                    from datetime import datetime
                    agent.deleted_at = datetime.utcnow()

                await db.commit()

        if dry_run:
            print(f"\n🔍 DRY RUN: Would delete {total_to_delete} duplicate agents")
            print("Run with --execute to perform actual deletion")
        else:
            print(f"\n✅ Successfully deleted {total_to_delete} duplicate agents")


if __name__ == "__main__":
    dry_run = "--execute" not in sys.argv

    if dry_run:
        print("🔍 Running in DRY RUN mode (no changes will be made)\n")
    else:
        print("⚠️  EXECUTING: Duplicate agents will be soft-deleted\n")

    asyncio.run(remove_duplicates(dry_run=dry_run))
