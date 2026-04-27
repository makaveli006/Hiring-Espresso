---
name: alembic-skills
description: "Manage Alembic database migrations for this project. Use when: creating migrations, applying schema changes, checking migration status, debugging Alembic errors, working around Supabase pgBouncer DDL timeouts, writing data migrations, or rolling back schema changes."
argument-hint: "Describe the schema change or migration task (e.g. 'add email column to users', 'rollback last migration', 'check migration status')"
---

# Alembic Database Migrations

## Project Setup

- **Backend dir**: `backend/` — ALL alembic commands must be run from here
- **Runner**: `uv run alembic ...` (NOT `alembic ...` directly)
- **Migration scripts**: `backend/alembic/versions/`
- **env.py**: `backend/alembic/env.py` — syncs from `app.core.config.settings.database_url`
- **Database**: Supabase PostgreSQL via pgBouncer transaction pooler

> **CRITICAL — Supabase DDL Limitation**: The project connects via pgBouncer transaction pooler. pgBouncer enforces a short statement timeout that **kills DDL commands** (`ALTER TABLE`, `CREATE INDEX`, etc.) before they complete. `alembic upgrade head` will fail for any migration that adds columns or creates indexes. See [Supabase DDL Workaround](#supabase-ddl-workaround) below.

---

## Common Commands

All commands are run from `backend/`:

```bash
# Check current DB revision
uv run alembic current

# Show full migration history
uv run alembic history

# Show pending (not yet applied) migrations
uv run alembic history --indicate-current

# Check if models have unapplied changes
uv run alembic check

# Generate a migration from model changes
uv run alembic revision --autogenerate -m "Add email to users"

# Apply all pending migrations (⚠️ fails for DDL on Supabase — see workaround)
uv run alembic upgrade head

# Apply to a specific revision
uv run alembic upgrade ae1027a6acf

# Downgrade one step
uv run alembic downgrade -1

# Downgrade to empty schema
uv run alembic downgrade base

# Show details of a specific revision
uv run alembic show ae1027a6acf
```

---

## Workflow: Add a New Column

### Step 1 — Edit the SQLAlchemy model

In `backend/app/models/<model>.py`, add the new `Mapped` field:

```python
# Example: adding nullable source column to Job
source: Mapped[str | None] = mapped_column(String(100), nullable=True)

# Example: adding non-nullable boolean with default
is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
```

### Step 2 — Generate the migration

```bash
cd backend
uv run alembic revision --autogenerate -m "Add is_active source to jobs"
```

Inspect the generated file in `alembic/versions/`. Verify the `upgrade()` and `downgrade()` are correct.

### Step 3 — Apply the migration

**Option A (non-Supabase / local dev):**
```bash
uv run alembic upgrade head
```

**Option B (Supabase — required for DDL):** See [Supabase DDL Workaround](#supabase-ddl-workaround) below.

---

## Supabase DDL Workaround

pgBouncer kills DDL statements. **Never** run `alembic upgrade head` for migrations with `ALTER TABLE` or `CREATE INDEX` on Supabase.

### Procedure

1. Open the **Supabase Dashboard → SQL Editor**
2. Translate the migration's `upgrade()` function into raw SQL
3. Add `IF NOT EXISTS` guards so it's idempotent
4. Manually update `alembic_version` at the end
5. Run all statements in one query block

### Template SQL

```sql
-- From alembic/versions/<rev>_<slug>.py upgrade()
ALTER TABLE <table> ADD COLUMN IF NOT EXISTS <column> <type> [NOT NULL] [DEFAULT <val>];
CREATE INDEX IF NOT EXISTS <index_name> ON <table>(<column>);

-- Advance the alembic version pointer
UPDATE alembic_version
SET version_num = '<new_rev>'
WHERE version_num = '<old_rev>';

-- Optional: backfill data
UPDATE <table> SET <column> = '<value>' WHERE <column> IS NULL;
```

### Real Example (from this project)

```sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source VARCHAR(100);
CREATE INDEX IF NOT EXISTS ix_jobs_is_active ON jobs(is_active);
UPDATE alembic_version SET version_num = '07199a478798' WHERE version_num = '6c7230917c19';
UPDATE jobs SET source = 'arbeitnow' WHERE source IS NULL;
```

### After running SQL Editor

Verify alembic agrees:
```bash
uv run alembic current
# Should show: <new_rev_id> (head)
```

---

## Workflow: Data Migration

Use `op.get_bind()` inside the migration to run SQL alongside schema changes:

```python
def upgrade():
    # 1. Add column as nullable first
    op.add_column('users', sa.Column('full_name', sa.String(255), nullable=True))

    # 2. Backfill data
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE users SET full_name = first_name || ' ' || last_name")
    )

    # 3. Now enforce NOT NULL after data exists
    op.alter_column('users', 'full_name', nullable=False)

def downgrade():
    op.drop_column('users', 'full_name')
```

> For Supabase: translate this into SQL Editor statements — the same 3-step pattern applies.

---

## env.py Reference

The project's `env.py` is already configured correctly. Key decisions:

- Uses `pool.NullPool` — no connection pooling in migrations
- Loads `.env` via `dotenv` before importing `settings`
- Uses `connect_args={"options": "-c statement_timeout=0"}` — disables timeout at session level (ignored by pgBouncer, but works on direct connections)
- `target_metadata = Base.metadata` — all models in `app/models/` are imported so autogenerate can diff them

If you ever need to add schema filtering (e.g., skip Supabase internal tables):

```python
def include_name(name, type_, parent_names):
    if type_ == "schema":
        return name in [None, "public"]
    return True

context.configure(
    connection=connection,
    target_metadata=target_metadata,
    include_name=include_name,
    include_schemas=True,
)
```

---

## Common Manual Operations

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add column
    op.add_column('jobs', sa.Column('salary_currency', sa.String(10), nullable=True))

    # Rename table
    op.rename_table('old_name', 'new_name')

    # Create index
    op.create_index('ix_jobs_workplace_type', 'jobs', ['workplace_type'])

    # Add unique constraint
    op.create_unique_constraint('uq_jobs_url', 'jobs', ['job_posting_url'])

    # Add foreign key
    op.create_foreign_key('fk_jobs_company', 'jobs', 'companies', ['company_id'], ['id'])

    # Change column type
    op.alter_column('jobs', 'title', type_=sa.String(500))

def downgrade():
    op.drop_constraint('fk_jobs_company', 'jobs', type_='foreignkey')
    op.drop_constraint('uq_jobs_url', 'jobs')
    op.drop_index('ix_jobs_workplace_type')
    op.rename_table('new_name', 'old_name')
    op.drop_column('jobs', 'salary_currency')
```

---

## Troubleshooting

### `QueryCanceled: statement timeout`
**Cause**: pgBouncer on Supabase kills long-running DDL.  
**Fix**: Use the [Supabase DDL Workaround](#supabase-ddl-workaround).

### `Target database is not up to date`
**Cause**: `alembic_version` table doesn't match latest revision.  
**Fix**: Check `uv run alembic current` vs `uv run alembic history`. If you applied SQL manually, ensure you ran the `UPDATE alembic_version` statement.

### `Can't locate revision identified by '<rev>'`
**Cause**: Migration file is missing or has wrong revision id in `down_revision`.  
**Fix**: Check `alembic/versions/` and verify `down_revision` in the file matches the previous migration's `revision`.

### `Column already exists` / `Table already exists`
**Cause**: Migration applied to DB but `alembic_version` wasn't updated (partial apply).  
**Fix**: Use `IF NOT EXISTS` guards in SQL Editor, then manually advance `alembic_version`.

### Autogenerate detects no changes but models changed
**Cause**: Models not imported in `env.py`.  
**Fix**: Add import to `backend/alembic/env.py`:
```python
from app.models import YourNewModel  # noqa: E402
```

---

## Checking Migration State Programmatically

```python
from alembic import config, script
from alembic.runtime import migration
from sqlalchemy import create_engine
from app.core.config import settings

def is_up_to_date() -> bool:
    cfg = config.Config("alembic.ini")
    directory = script.ScriptDirectory.from_config(cfg)
    engine = create_engine(settings.database_url)
    with engine.begin() as connection:
        ctx = migration.MigrationContext.configure(connection)
        current = set(ctx.get_current_heads())
        latest = set(directory.get_heads())
        return current == latest
```

---

## Project Models Tracked by Alembic

All five models are imported in `env.py` and tracked:

| Model | Table | Key columns |
|-------|-------|-------------|
| `Job` | `jobs` | `id`, `title`, `company_id`, `is_active`, `source`, `workplace_type`, `posted_at` |
| `Company` | `companies` | `id`, `name`, `logo_url`, `website` |
| `User` | `users` | `id`, `clerk_id`, `email` |
| `SavedJob` | `saved_jobs` | `user_id`, `job_id` |
| `HiddenJob` | `hidden_jobs` | `user_id`, `job_id` |
