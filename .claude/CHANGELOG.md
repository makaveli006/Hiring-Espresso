# Changelog

All notable changes to Hiring Espresso are documented here.

---

## [Unreleased]

- [Created] `.claude/specs/job-data-ingestion.md` — comprehensive spec for replacing dummy job data with a real 3-tier ingestion pipeline (Arbeitnow/Remotive → Greenhouse/Lever ATS → Exa/Firecrawl/Brave Search scraping) using OpenAI API for AI normalization

### Job Data Ingestion Pipeline

- [Added] `openai`, `apscheduler`, `beautifulsoup4`, `tenacity` dependencies to `backend/pyproject.toml`
- [Changed] `backend/app/core/config.py` — added ingestion settings: `openai_api_key`, `ingestion_enabled`, `ingestion_schedule_hours`, `ingestion_batch_size`, `ingestion_rate_limit_delay`, `greenhouse_board_tokens`, `lever_company_slugs`
- [Created] `backend/app/ingestion/models/raw_job.py` — `RawJob` and `NormalizedJob` dataclasses (source-agnostic intermediates)
- [Created] `backend/app/ingestion/sources/base.py` — abstract `BaseJobFetcher` contract
- [Created] `backend/app/ingestion/sources/arbeitnow.py` — paginated fetcher for Arbeitnow API (~800 jobs, no auth)
- [Created] `backend/app/ingestion/sources/remotive.py` — fetcher for Remotive API (~300 remote-tech jobs, no auth)
- [Created] `backend/app/ingestion/sources/greenhouse.py` — per-board fetcher for Greenhouse ATS public API
- [Created] `backend/app/ingestion/normalizer.py` — OpenAI `gpt-4o-mini` batch normalizer; extracts skills, YOE, department, salary, location, workplace_type from raw job descriptions
- [Created] `backend/app/repositories/ingestion_repository.py` — `upsert_company()` + `insert_job()` + `get_existing_urls()` for DB writes
- [Created] `backend/app/ingestion/pipeline.py` — orchestrator wiring fetchers → dedup → normalizer → repository; URL-based + content-hash deduplication
- [Created] `backend/app/ingestion/scheduler.py` — `APScheduler BackgroundScheduler` running every `INGESTION_SCHEDULE_HOURS` hours
- [Changed] `backend/app/main.py` — added FastAPI `lifespan` context manager to start/stop the ingestion scheduler
- [Created] `backend/scripts/ingest.py` — CLI for manual/initial seed runs (`--source`, `--dry-run`, `--verbose`)
- [Changed] `backend/.env.example` — documented all new ingestion environment variables

### Job Staleness / Expiry

- [Changed] `backend/app/models/job.py` — added `is_active: Mapped[bool]` (default `true`) and `source: Mapped[str | None]` columns
- [Migration] `backend/alembic/versions/07199a478798_add_is_active_source_to_jobs.py` — adds `is_active BOOLEAN NOT NULL DEFAULT true`, `source VARCHAR(100)`, and `ix_jobs_is_active` index to `jobs` table
- [Created] `backend/scripts/migrate_direct.py` — runs the migration via Supabase session pooler (port 6543) to bypass pgBouncer DDL statement_timeout
- [Changed] `backend/app/repositories/ingestion_repository.py` — `insert_job()` now stores `source` and `is_active=True`; added `deactivate_removed()` and `reactivate_seen()` for per-source staleness management
- [Changed] `backend/app/ingestion/pipeline.py` — after each source fetch, calls `deactivate_removed()` + `reactivate_seen()` so filled/removed jobs disappear from the UI automatically
- [Changed] `backend/app/repositories/job_repository.py` — `get_jobs()` and `get_by_id()` now filter `WHERE is_active = TRUE`; filled jobs are silently hidden
- [Fixed] `'int' object has no attribute 'replace'` in `arbeitnow.py` — Arbeitnow returns `created_at` as a Unix timestamp integer; fixed by using `datetime.fromtimestamp(int(raw_date), tz=timezone.utc)`

---

## [0.1.0] — 2026-04-27 · Initial Scaffold

### Project Initialized
- Created monorepo structure: `frontend/` (Vite + React 19 + TypeScript) and `backend/` (FastAPI + Python via `uv`)
- Wrote `CLAUDE.md` with full project conventions, stack reference, setup commands, and design decisions
- Added comprehensive `.gitignore` covering secrets, Node, Python, OS files, editors, cloud infra (Terraform, Vercel, Netlify), Docker, and test artifacts

---

### Frontend

#### Setup & Config
- Scaffolded Vite + React 19 + TypeScript project
- Configured `@/` path alias in both `tsconfig.app.json` and `tsconfig.json`
- Configured Vite to use `@tailwindcss/vite` plugin (Tailwind v4 — no `tailwind.config.js`)
- Set `"ignoreDeprecations": "6.0"` to silence TypeScript `baseUrl` deprecation warning

#### Tailwind v4 + Design System
- Set up `src/index.css` with `@import "tailwindcss"` and `@theme` block
- Defined brand color tokens: primary pink `oklch(0.558 0.243 351.3)` = `#e91e8c`
- Added neutral palette, badge color variants (remote/hybrid/onsite/YOE), shadow tokens
- Overrode shadcn's default `--primary` to HiringCafe pink

#### Dependencies Installed
- `tailwindcss@4.2.4`, `@tailwindcss/vite`
- `zustand@5.0.12`
- `@tanstack/react-query@5.100.5`
- `zod@4.3.6`
- `framer-motion`
- `@clerk/clerk-react`
- `lucide-react`, `clsx`, `tailwind-merge`
- `eslint`, `prettier`, `eslint-config-prettier`, `@typescript-eslint/*`, `husky`, `lint-staged`

#### shadcn/ui
- Initialized shadcn with Tailwind v4 support
- Added components: `button`, `card`, `dialog`, `input`, `badge`, `skeleton`, `separator`, `scroll-area`, `checkbox`
- Fixed unused React import in `scroll-area.tsx` (TS6133 error)

#### Code Quality
- Created `.eslintrc.json` with TypeScript rules
- Created `.prettierrc` (single quotes, no semi, 100 char width)
- Created `.lintstagedrc.json` for pre-commit lint + format

#### Zod Schemas (`src/schemas/`)
- `env.schema.ts` — validates `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`, `VITE_SENTRY_DSN` at startup
- `job.schema.ts` — `Job`, `Company`, `JobListResponse` types with full Zod validation
- `filter.schema.ts` — `Filters` type for all search/filter params

#### Zustand Stores (`src/store/`)
- `useFilterStore.ts` — active filters, `setFilter`, `toggleWorkplaceType`, `resetFilters`
- `useJobStore.ts` — saved/hidden job IDs with `persist` middleware (localStorage)
- `useUIStore.ts` — modal open states (auth, location, active filter modal)

#### API Layer (`src/api/`)
- `client.ts` — typed `apiFetch` with automatic Bearer token attachment from Clerk
- `jobs.ts` — `fetchJobs`, `fetchJob`, `saveJob`, `unsaveJob`, `hideJob` with Zod validation on responses

#### TanStack Query Hooks (`src/hooks/`)
- `useDebounce.ts` — generic debounce hook (300ms default)
- `useJobs.ts` — `useInfiniteJobs` (cursor pagination), `useJob`, `useSaveJob`, `useHideJob`

#### Layout System (`src/components/layout/`)
- `Header.tsx` — logo, debounced search bar, location pill, Sign Up / UserButton (Clerk), hamburger menu
- `FilterBar.tsx` — horizontally scrollable filter chips (13 job filters + 5 company filters) with active state + active workplace badges
- `Footer.tsx` — About, Talent Network, Terms, Privacy + copyright
- `MobileNav.tsx` — fixed bottom tab bar with Home, Saved, Messages, Profile icons (mobile only)
- `RootLayout.tsx` — composes all layout pieces + mounts global modals

#### Search Components (`src/components/search/`)
- `SearchBar.tsx` — debounced input (300ms) wired to `useFilterStore`
- `LocationPill.tsx` — shows country + environment tags, opens location filter modal on click

#### Filter Components (`src/components/filters/`)
- `FilterChip.tsx` — outlined pill, pink border/text when active
- `FilterModal.tsx` — "Locations & Environments" dialog with Workplace Type checkboxes (wired to Zustand), Physical Position, Environment, Labor Intensity, Cognitive Demand, Computer Usage, Oral Communication — scrollable body + pink Apply button

#### Auth Components (`src/components/auth/`)
- `AuthModal.tsx` — wraps Clerk `<SignIn>` in a Dialog with HiringCafe pink theme overrides

#### Job Components (`src/components/jobs/`)
- `JobCard.tsx` — company logo/name/ticker, job title, location, workplace + commitment badges, YOE badge, description snippet, skills list, save button (Bookmark), Job Posting link, "See views", Framer Motion entrance animation
- `JobCarousel.tsx` — section title with arrow, left/right scroll buttons, horizontal scroll container, skeleton loading state (4 placeholder cards)

#### Mock Data & Pages
- `src/data/mockJobs.ts` — 6 realistic mock jobs (Wipro, Bechtel, Nestlé, Cognizant, Valmet, Accenture) matching the HiringCafe screenshot
- `src/pages/HomePage.tsx` — renders "Latest Jobs in India" + "Remote Jobs" carousels from mock data
- `src/App.tsx` — cleaned up Vite boilerplate, now renders `<RootLayout><HomePage /></RootLayout>`

#### Entry Point (`src/main.tsx`)
- Wrapped app with `<ClerkProvider>`, `<QueryClientProvider>`
- QueryClient config: `staleTime: 60s`, `retry: 2`, `gcTime: 5min`

#### Environment
- Created `frontend/.env.local` with `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`

#### Build Verification
- `npm run build` passes cleanly — 2407 modules transformed, no TypeScript errors

---

### Backend

#### Setup
- Initialized Python project with `uv init` + `uv venv` (Python 3.13.3)
- Created full folder structure: `app/api/`, `app/services/`, `app/repositories/`, `app/models/`, `app/schemas/`, `app/core/`, `tests/`

#### Dependencies Installed (via `uv add`)
- `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `psycopg2-binary`
- `pydantic`, `pydantic-settings`, `python-dotenv`
- `loguru`, `sentry-sdk`, `slowapi`
- `python-jose[cryptography]`, `httpx`
- Dev: `pytest`, `pytest-asyncio`

#### Core (`app/core/`)
- `config.py` — Pydantic Settings reading from `.env`; `cors_origins_list` property
- `database.py` — SQLAlchemy engine + `SessionLocal` + `Base` + `get_db` dependency
- `security.py` — Clerk JWT verification via JWKS endpoint (cached); `get_current_user` / `get_optional_user` FastAPI dependencies
- `logging.py` — loguru setup: stdout + rotating file sink (`logs/app.log`, 10MB, 7-day retention)

#### Models (`app/models/`)
- `Company` — id, name, logo_url, ticker, exchange, description, website
- `Job` — full schema with indexes on `posted_at`, `workplace_type`, `location_country`; ARRAY column for skills
- `User` — clerk_id (unique), email
- `SavedJob` — user_id + job_id with unique constraint
- `HiddenJob` — user_id + job_id with unique constraint

#### Pydantic Schemas (`app/schemas/`)
- `CompanyOut`, `JobOut`, `JobListResponse`, `JobFilters`, `UserOut`

#### Repository Layer (`app/repositories/`)
- `job_repository.py` — `get_jobs` with dynamic multi-filter building + cursor-based pagination; `get_by_id`
- `user_repository.py` — `get_or_create`, `save_job`, `unsave_job`, `hide_job`, `get_saved_jobs`

#### Service Layer (`app/services/`)
- `job_service.py` — `list_jobs`, `get_job`
- `user_service.py` — `get_or_create_user`, `save_job`, `unsave_job`, `hide_job`, `get_saved_jobs`

#### API Routes (`app/api/`)
- `GET /api/v1/jobs` — paginated, multi-filter (keyword, location, workplace_type, commitment, department, yoe, salary, cursor, limit)
- `GET /api/v1/jobs/{id}` — single job
- `POST /api/v1/jobs/{id}/save` — auth required
- `DELETE /api/v1/jobs/{id}/save` — auth required
- `POST /api/v1/jobs/{id}/hide` — auth required
- `GET /api/v1/users/me/saved-jobs` — auth required
- `GET /health` — health check

#### `app/main.py`
- Sentry SDK init (conditional on `SENTRY_DSN`)
- CORS middleware
- slowapi rate limiter (100 req/min per IP)
- HTTP request/response logging middleware (loguru)

#### Alembic
- Initialized with `alembic init`
- Fixed `env.py` to: load `.env` via `python-dotenv`, import all models for metadata registration, build engine directly from `settings.database_url` (bypasses `configparser` `%` interpolation bug)
- Generated migration `6c7230917c19_initial_schema.py` (all 5 tables + 3 indexes)
- Successfully ran `alembic upgrade head` against Supabase — all tables created

#### Tests (`tests/`)
- `test_jobs.py` — health check, list jobs 200, get job 404, save job 403 (no auth)

#### Environment (`backend/.env`)
- `DATABASE_URL` — Supabase Session Pooler URL with URL-encoded special characters in password + `?sslmode=require`
- `CLERK_SECRET_KEY`, `CLERK_JWKS_URL`, `SENTRY_DSN`, `CORS_ORIGINS`

---

### CI/CD
- `.github/workflows/ci.yml` — two jobs:
  - **frontend**: Node 22, `npm ci` → `npm run lint` → `npm run build`
  - **backend**: `uv sync` → `pytest tests/ -v` (SQLite in-memory for tests)

---

### Bugs Fixed
| Error | Fix |
|---|---|
| `baseUrl` deprecated (TS) | Added `"ignoreDeprecations": "6.0"` to `tsconfig.app.json` |
| `'React' is declared but never read` in `scroll-area.tsx` | Removed unused `import * as React` |
| shadcn init failing (no alias, no Tailwind config) | Added `compilerOptions.paths` to `tsconfig.json`; set up `src/index.css` with `@import "tailwindcss"` first |
| Alembic `Can't load plugin: sqlalchemy.dialects:driver` | `.env` not being loaded — fixed `env.py` to use `python-dotenv` + `settings.database_url` directly |
| Alembic `invalid interpolation syntax` (`%` in password) | Bypassed `configparser` by creating engine directly with `create_engine(settings.database_url)` |
| Supabase DNS `Name or service not known` | Switched from direct host (`db.xxx.supabase.co`) to Session Pooler (`aws-1-ap-south-1.pooler.supabase.com:5432`) + URL-encoded password special chars + added `?sslmode=require` |

---

## [0.2.0] — 2026-04-27 · Playwright E2E Test Suite

### Testing — Frontend

#### Playwright Setup
- [Added] `@playwright/test@^1.59.1` as dev dependency — E2E test runner
- [Created] `frontend/playwright.config.ts` — multi-browser config (chromium, firefox, webkit, mobile-chrome, mobile-safari); baseURL `http://localhost:5173`; `webServer` auto-starts `npm run dev`; trace + screenshot on failure
- [Created] `frontend/tsconfig.test.json` — separate TS config for test files (includes `tests/` + `playwright.config.ts`)
- [Changed] `frontend/package.json` — added `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:report` npm scripts

#### Page Object Models (`frontend/tests/pages/`)
- [Created] `tests/pages/base.page.ts` — `BasePage` abstract class with `goto(path)` + `waitForLoadState`
- [Created] `tests/pages/home.page.ts` — `HomePage`: header/main/footer locators, `carousel(title)`, `jobTitlesInCarousel(title)`, scroll helpers
- [Created] `tests/pages/header.page.ts` — `HeaderPage`: logo, searchInput, locationPill, signUpButton, menuButton
- [Created] `tests/pages/filter-bar.page.ts` — `FilterBarPage`: `chip(label)`, `isChipActive(label)`
- [Created] `tests/pages/filter-modal.page.ts` — `FilterModalPage`: dialog, title, locationSearchInput, applyButton, `workplaceCheckbox(type)`, `close()`

#### Fixtures (`frontend/tests/fixtures/`)
- [Created] `tests/fixtures/app.fixture.ts` — extended `test` with `homePage`, `headerPage`, `filterBarPage`, `filterModalPage` fixtures (each auto-navigates to `/`)

#### Test Data (`frontend/tests/utils/`)
- [Created] `tests/utils/test-data.ts` — `ONSITE_JOBS`, `REMOTE_JOBS`, `JOB_FILTER_CHIPS`, `COMPANY_FILTER_CHIPS`, `WORKPLACE_TYPES` matching `mockJobs.ts`

#### Spec Files (`frontend/tests/e2e/`)
- [Created] `tests/e2e/homepage/homepage.spec.ts` — 7 tests: layout renders, both carousels visible, correct job counts, scroll buttons, page title
- [Created] `tests/e2e/search/search.spec.ts` — 6 tests: visibility, fill, clear, placeholder, focus, real-time update
- [Created] `tests/e2e/filters/filter-chips.spec.ts` — 5 tests: all job/company chips visible, click activates, click again deactivates, mutual exclusion, active styling
- [Created] `tests/e2e/filters/filter-modal.spec.ts` — 8 tests: opens via LocationPill, location input, workplace checkboxes, Remote toggle, Apply closes, Escape closes, badge appears in FilterBar, location search input
- [Created] `tests/e2e/jobs/job-card.spec.ts` — 10 tests: titles render, workplace badges, commitment badge, company name, posted time, YOE badge, save toggle, unsave, localStorage persistence, job posting link
- [Created] `tests/e2e/auth/auth-modal.spec.ts` — 6 tests: Sign up visible, opens dialog, Escape closes, not open by default, button has primary bg, pill shape
- [Created] `tests/e2e/layout/mobile-nav.spec.ts` — 8 tests: visible on mobile, 4 nav links (Home/Saved/Messages/Profile), 4 items total, Home active on `/`, hidden on desktop

### Bugs Fixed
| Error | Fix |
|---|---|
| `FilterModal` unreachable from UI — `LocationPill` called `setLocationModalOpen` but `FilterModal` checks `activeFilterModal === 'locations'` | Fixed `LocationPill.tsx` to call `setActiveFilterModal('locations')` instead |
| Job card save button had no accessible name (icon-only button) | Added `aria-label={saved ? 'Unsave job' : 'Save job'}` to `JobCard.tsx` |

---

## [0.3.0] — 2026-04-27 · Visual QA Pass + Puppeteer Screenshot Workflow

### Visual QA Tooling
- [Added] `puppeteer@24.4.0` as dev dependency in `frontend/`
- [Created] `.claude/screenshot.mjs` — Puppeteer script that captures desktop (1440px) + mobile (390px) screenshots of `http://localhost:5173`; saves `current.png`, `current-mobile.png`, and timestamped copies to `.claude/screenshots/`
- [Created] `.claude/screenshots/` — screenshot output directory
- [Changed] `.claude/CLAUDE.md` — added **Visual QA Workflow** section mandating Puppeteer screenshot + comparison after every UI change (target: within ~2–3px of reference)
- [Changed] `.claude/CLAUDE.md` — added **Changelog Rule** section mandating CHANGELOG.md updates after every meaningful action

### Visual Fixes (Round 1 → Round 2 comparison)
- [Fixed] `frontend/src/components/jobs/JobCard.tsx` — replaced `Eye` icon with `TrendingUp` (↗) for "See views" footer label; matches HiringCafe reference exactly
- [Fixed] `frontend/src/components/jobs/JobCard.tsx` — TS error `TS6133: 'TrendingUp' is declared but its value is never read` + `TS2304: Cannot find name 'Eye'` — updated import and JSX usage in same edit
- [Changed] `frontend/src/components/layout/FilterBar.tsx` — replaced `<div>` divider with `|` pipe character separator between job chips and company chips; matches reference
- [Changed] `frontend/src/components/layout/FilterBar.tsx` — passed `variant="company"` to company filter chips (Company, Industry, Stage & Funding, Size, Founding Year)
- [Changed] `frontend/src/components/filters/FilterChip.tsx` — added `variant` prop (`'default' | 'company'`); company variant renders amber/gold border + text to match HiringCafe's visual distinction between job filters and company filters
