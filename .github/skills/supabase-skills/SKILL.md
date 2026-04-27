---
name: supabase-skills
description: "Use when doing ANY task involving Supabase or Postgres. Triggers: Supabase Database, Auth, Edge Functions, Realtime, Storage, Vectors, Cron, Queues; schema changes, migrations, Alembic DDL issues, pgBouncer timeouts, DDL on Supabase, session pooler, connection pooling; RLS, row-level security, policies, auth.uid(); query optimization, indexes, partial indexes, covering indexes, EXPLAIN ANALYZE; upserts, pagination, N+1 queries, batch inserts; schema design, data types, foreign keys, constraints; supabase-js, @supabase/ssr; Supabase CLI or MCP server; pg_graphql, pg_cron, pg_vector."
argument-hint: "Describe the Supabase or Postgres task (e.g. 'create a migration', 'fix DDL timeout', 'add RLS policy', 'optimize query', 'upsert rows')"
---

# Supabase + Postgres Best Practices

This skill covers two domains — read both sections before implementing.

---

## Part 1: Supabase Platform

### Core Principles

1. **Supabase changes frequently — verify against current docs before implementing.** Don't rely on training data for function signatures or config.
2. **Verify your work.** Run a test query after every fix.
3. **Recover from errors, don't loop.** After 2-3 failed attempts, change approach.

### pgBouncer DDL Limitation — CRITICAL for this project

The project connects via **pgBouncer transaction pooler** (port 5432). pgBouncer kills DDL commands (`ALTER TABLE`, `CREATE INDEX`, etc.) before they complete. `alembic upgrade head` will **hang or fail** for any migration with DDL.

**Workaround: use the Supabase session pooler (port 6543) via psycopg2 directly.**

```python
import psycopg2

# Replace :5432/ with :6543/ in the DATABASE_URL
session_url = database_url.replace(":5432/", ":6543/")

conn = psycopg2.connect(session_url, connect_timeout=15, sslmode="require")
conn.autocommit = True
cur = conn.cursor()
cur.execute("SET statement_timeout = 0")

# Run all DDL here
cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true")
cur.execute("CREATE INDEX IF NOT EXISTS ix_jobs_is_active ON jobs(is_active)")

# Stamp alembic version manually
cur.execute("UPDATE alembic_version SET version_num = '<new_rev>' WHERE version_num = '<old_rev>'")

cur.close()
conn.close()
```

This is the established pattern in `backend/scripts/migrate_direct.py`. Always create a new `scripts/migrate_<name>.py` for each DDL migration rather than using `alembic upgrade head`.

### RLS — Required for all tables in the public schema

Enable RLS on every table in any exposed schema. Tables reachable via the Data API must have RLS enabled.

```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
```

After enabling RLS, create policies matching the actual access model. For public read-only data:

```sql
-- Allow anyone to read active jobs
CREATE POLICY jobs_public_read ON jobs
  FOR SELECT
  USING (is_active = true);

-- Only service role can write
CREATE POLICY jobs_service_write ON jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Security Checklist

Run through these when touching auth, RLS, views, storage, or user data:

- **Never use `user_metadata` / `raw_user_meta_data` in authorization decisions** — it is user-editable. Use `app_metadata` instead.
- **Deleting a user does not invalidate access tokens.** Sign out or revoke sessions first.
- **Views bypass RLS by default.** Use `CREATE VIEW ... WITH (security_invoker = true)` (Postgres 15+) or put views in a private schema.
- **UPDATE requires a SELECT policy.** Without SELECT, updates silently return 0 rows.
- **Never expose `service_role` key in frontend code.** Any `VITE_` / `NEXT_PUBLIC_` env var is sent to the browser.
- **Storage upsert requires INSERT + SELECT + UPDATE** — INSERT alone silently fails on file replacement.

### Supabase CLI

Always discover commands via `--help` — never guess.

```bash
supabase --help
supabase db --help
supabase db query --help   # Requires CLI v2.79.0+
supabase db advisors       # Requires CLI v2.81.3+
```

When committing schema changes:

1. Run `supabase db advisors` — fix issues
2. Run `supabase db pull <name> --local --yes` — generates migration file
3. Verify with `supabase migration list --local`

Do **not** use `apply_migration` to iterate — it writes a history entry on every call.

### Data API Access

Newly created tables may not be auto-exposed via the REST API. Grant access explicitly and enable RLS:

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.jobs TO anon, authenticated;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
```

---

## Part 2: Postgres Best Practices

### Query Performance — CRITICAL

**Add indexes on all WHERE and JOIN columns:**

```sql
-- Without index: full table scan (Seq Scan)
-- With index: 100-1000x faster (Index Scan)
CREATE INDEX jobs_company_id_idx ON jobs (company_id);
```

**Use partial indexes for filtered queries (5-20x smaller):**

```sql
-- Only index active jobs — matches WHERE is_active = true queries
CREATE INDEX ix_jobs_last_validated_at ON jobs(last_validated_at)
WHERE is_active = true;

-- Only index non-null values
CREATE INDEX ix_jobs_external_id ON jobs(external_id)
WHERE external_id IS NOT NULL;
```

**Use covering indexes to avoid table lookups:**

```sql
-- Include SELECT columns in index to enable index-only scan
CREATE INDEX orders_status_idx ON orders (status)
INCLUDE (customer_id, total);
```

**Wrap `auth.uid()` in SELECT in RLS policies to cache the call:**

```sql
-- Bad: auth.uid() called for every row
CREATE POLICY p ON orders USING (auth.uid() = user_id);

-- Good: called once, cached (100x faster on large tables)
CREATE POLICY p ON orders USING ((SELECT auth.uid()) = user_id);
```

### Connection Management — CRITICAL

**Always use connection pooling.** Direct connections cost 1-3MB RAM each.

- **Transaction mode** (default, pgBouncer port 5432): best for most queries, but breaks DDL and prepared statements
- **Session mode** (port 6543): needed for DDL, `SET` commands, temp tables, prepared statements

In SQLAlchemy, always set `pool_pre_ping=True`:

```python
engine = create_engine(settings.database_url, pool_pre_ping=True)
```

**Configure idle timeouts** to reclaim connection slots:

```sql
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET idle_session_timeout = '10min';
SELECT pg_reload_conf();
```

### Schema Design — HIGH

**Use correct data types:**

```sql
-- IDs: bigint identity (not serial, not int)
id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY

-- Strings: text (not varchar unless constraint needed)
email text

-- Timestamps: always timestamptz (not timestamp)
created_at timestamptz DEFAULT now()

-- Booleans: boolean (not varchar, not int)
is_active boolean NOT NULL DEFAULT true
```

**Always index foreign key columns** — Postgres does NOT do this automatically:

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

**Add constraints idempotently** — `ADD CONSTRAINT IF NOT EXISTS` is not valid SQL:

```sql
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'jobs_dedup_hash_unique'
    AND conrelid = 'public.jobs'::regclass
  ) THEN
    ALTER TABLE jobs ADD CONSTRAINT jobs_dedup_hash_unique UNIQUE (dedup_hash);
  END IF;
END $$;
```

### Data Access Patterns — MEDIUM

**Use cursor-based pagination (not OFFSET):**

```sql
-- Bad: scans all skipped rows (gets slower on deep pages)
SELECT * FROM jobs ORDER BY id LIMIT 20 OFFSET 1980;

-- Good: always O(1) with indexed cursor
SELECT * FROM jobs WHERE id > $cursor ORDER BY id LIMIT 20;
```

**Batch inserts instead of individual rows:**

```sql
INSERT INTO events (user_id, action) VALUES
  (1, 'click'), (2, 'view'), (3, 'click');
-- Not: one INSERT per row
```

**Use UPSERT for insert-or-update (atomic, no race condition):**

```sql
INSERT INTO jobs (id, title, dedup_hash)
VALUES ($1, $2, $3)
ON CONFLICT (dedup_hash) DO UPDATE
SET title = EXCLUDED.title, updated_at = now();
```

**Eliminate N+1 queries — use ANY or JOIN:**

```sql
-- Bad: one query per job in a loop
SELECT * FROM companies WHERE id = $job_company_id;

-- Good: one query for all
SELECT * FROM companies WHERE id = ANY($1::text[]);
```

### Monitoring

Check query performance with:

```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find missing indexes
SELECT schemaname, tablename, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan AND seq_scan > 100
ORDER BY seq_scan DESC;
```

---

## Reference Files

Full rule details in:

- [`supabase/SKILL.md`](supabase/SKILL.md) — Supabase platform, CLI, MCP, security
- [`supabase-postgres-best-practices/SKILL.md`](supabase-postgres-best-practices/SKILL.md) — Postgres rules index
- [`supabase-postgres-best-practices/references/`](supabase-postgres-best-practices/references/) — 30+ individual rule files
