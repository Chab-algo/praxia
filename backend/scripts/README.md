# Backend Scripts

## Remove Duplicate Agents

This script detects and removes duplicate agents from the database.

### Usage

**1. Dry run (recommended first):**
```bash
python -m scripts.remove_duplicate_agents
```

This will show you what would be deleted without making any changes.

**2. Execute deletion:**
```bash
python -m scripts.remove_duplicate_agents --execute
```

This will soft-delete duplicate agents, keeping only the oldest one.

### How it works

- Finds agents with the same `name`, `recipe_slug`, and `created_by`
- Keeps the oldest agent (by `created_at`)
- Soft-deletes all duplicates (sets `deleted_at` timestamp)
- Shows detailed output of what was found and deleted

### Example output

```
Found 2 sets of duplicate agents:

📦 Review Responder (review_responder)
   User: user_abc123
   Total: 3 duplicates
   ✅ Keep: agent_id_1 (created 2026-02-01 10:00:00)
   ❌ Delete: 2 agents
      - agent_id_2 (created 2026-02-05 14:30:00)
      - agent_id_3 (created 2026-02-09 18:45:00)

🔍 DRY RUN: Would delete 2 duplicate agents
Run with --execute to perform actual deletion
```
