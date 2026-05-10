# Changelog

All notable changes to Hiring Espresso are documented here.

---

## [Unreleased]

- [Fixed] `/saved` route tab alignment — changed route from `ContentLayout` (max-w-2xl, 672px narrow) to `RootLayout hideFilterBar` (full-width) so Tracker/Saved Searches/Boards tabs render left-aligned at the page edge instead of centered in a narrow column
- [Changed] `frontend/src/layouts/RootLayout.tsx` — added optional `hideFilterBar` prop so `/saved` can use the full-width layout without showing the job-filter chip row
- [Changed] `frontend/src/App.tsx` — `/saved` route now uses `RootLayout hideFilterBar` instead of `ContentLayout`
- [Changed] `frontend/src/pages/SavedJobsPage.tsx` — `TrackerView` outer div uses `-mx-4 -mt-6` to break out of `main`'s padding, tab border now spans full viewport width edge-to-edge; removed double-centering `mx-auto max-w-7xl` inner container; content sections use `px-4 sm:px-8 py-6` for consistent left-aligned padding
- [Changed] `frontend/src/pages/SavedJobsPage.tsx` — tab bar gets `pt-2` (8px) so tab text sits ~20px below the header border matching the reference; empty state card changed from `p-16` to `min-h-[280px] flex flex-col items-center justify-center px-8` so text is vertically centered in a ~280px tall card

- [Added] `frontend/src/pages/SavedJobsPage.tsx` — built signed-in TrackerView: three top-level tabs (Tracker / Saved Searches / Boards), five status chips (Saved / Applied / Interviewing / Rejected / Hidden) with pink active border, dynamic section heading with count, empty-state card with "adding jobs" link to /, and JobCard grid when jobs exist
- [Changed] `frontend/src/store/useJobStore.ts` — added `interviewingJobIds`, `rejectedJobIds` arrays, `markInterviewing`, `markRejected` actions, and `isJobInterviewing`, `isJobRejected` selectors; persisted via existing zustand/persist
- [Changed] `frontend/src/pages/SavedJobsPage.tsx` — restyled signed-out empty state to match hiring.cafe tracker reference: white background, normalized typography sizes (28px title, 15px body, 13px pill/footer), tightened max-width to 640px, added `Frequently Asked Questions` mustard heading, collapsed FAQs by default, kept brand as `Hiring Espresso` per project rule
- [Added] `.claude/CLAUDE.md` + `.github/copilot-instructions.md` — `Brand Name — CRITICAL` section forbidding renaming `Hiring Espresso` to `HiringCafe` / `hiring.cafe`
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Industry` modal with three cards (`Organization Type`, `Company Industry`, `Company Activities & Keywords`), include/exclude dropdown-search fields, persisted industry filter state, and company-chip active highlighting
- [Created] `frontend/tests/e2e/filters/industry-modal.spec.ts` — added E2E coverage for Industry modal rendering, mutually exclusive `No options` dropdown panel behavior, and apply persistence/chip highlight
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Company` modal with include/exclude company names and include/exclude HQ countries fields, persisted company filter state, and company-chip active highlighting
- [Created] `frontend/tests/e2e/filters/company-modal.spec.ts` — added E2E coverage for Company modal render, mutually exclusive dropdown panel behavior, and apply persistence/chip highlight
- [Fixed] `frontend/tests/e2e/filters/company-modal.spec.ts` — stabilized dropdown overlay assertion by handling toggle behavior deterministically so only one `No options` panel is asserted visible after each targeted dropdown interaction
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Stage & Funding` modal with Investors / Exclude Investors, Latest Round / Exclude Latest Round, Raised In Or After year, and Latest Round Amount Raised currency fields; added persisted stage filter state and company-chip active highlighting
- [Created] `frontend/tests/e2e/filters/stage-funding-modal.spec.ts` — added E2E coverage for Stage & Funding modal field rendering and apply persistence behavior
- [Fixed] `strict mode violation` in `frontend/tests/e2e/filters/stage-funding-modal.spec.ts` — disambiguated overlapping textbox accessible names by using `exact: true` in role selectors
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — split Stage & Funding content into separate individual cards for `Latest Round`, `Exclude Latest Round`, `Raised In Or After`, and `Latest Round Amount Raised` to match requested modal structure
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — removed card styling from Stage & Funding `Raised In Or After` and `Latest Round Amount Raised`; these now render as plain standalone sections below the dropdown cards
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — merged Stage & Funding `Latest Round` and `Exclude Latest Round` back into a single shared card while keeping `Raised In Or After` and `Latest Round Amount Raised` as plain sections
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — Stage & Funding dropdown-style fields now open a menu panel with `No options` when the chevron or input is focused, matching expected dropdown behavior
- [Fixed] `frontend/src/components/filters/FilterModal.tsx` — Stage & Funding dropdown overlays are now mutually exclusive; opening one dropdown closes any previously open dropdown so only the currently active field shows `No options`
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Travel Requirement` modal with independent air/land travel multi-select options, fixed footer + scrollable body layout to keep last `Extensive` option visible, persisted `travel_air`/`travel_land` state, and chip active highlighting
- [Created] `frontend/tests/e2e/filters/travel-modal.spec.ts` — added E2E coverage for Travel modal section rendering, last `Extensive` visibility/interactivity near footer, apply persistence, and chip highlight behavior
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Benefits & Perks` modal with independent multi-select options, two-column desktop layout, persisted `benefits_perks` filter state, and chip active highlighting when selections are applied
- [Created] `frontend/tests/e2e/filters/benefits-modal.spec.ts` — added E2E coverage for Benefits & Perks modal rendering, independent checkbox toggling, and apply persistence behavior
- [Changed] `frontend/src/components/layout/FilterBar.tsx` — moved company chips (`Company`, `Industry`, `Stage & Funding`, `Size`, `Founding Year`) into the same inline row immediately after `Encouraged to Apply` with an inline separator, removing the separate second company row
- [Changed] `frontend/tests/e2e/filters/filter-chips.spec.ts` — added ordering assertion to verify `Company` appears directly after `Encouraged to Apply` in the unified filter-chip row
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Encouraged to Apply` modal with multi-select options (Military Veterans, Fair Chance), persisted `encouraged_to_apply` filter state, and job-chip active highlighting when selections are applied
- [Created] `frontend/tests/e2e/filters/encouraged-modal.spec.ts` — added E2E coverage for Encouraged to Apply modal rendering, checkbox toggling, apply persistence, and chip highlight clear behavior when all selections are removed
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated `Size` company modal with `All` default/exclusive behavior, full selection list, persisted `company_size` filter state, and active chip highlighting when specific size ranges are applied
- [Created] `frontend/tests/e2e/filters/size-modal.spec.ts` — added E2E coverage for Size modal rendering, `All` toggle semantics, persistence after apply, and chip active-state behavior
- [Added] `frontend/src/components/filters/FilterModal.tsx` + `frontend/src/schemas/filter.schema.ts` + `frontend/src/components/layout/FilterBar.tsx` — implemented dedicated Founding Year modal with strict 4-digit validation, open-ended `Present` max behavior (`founding_year_max` undefined), persisted filter state, and active company-chip highlighting
- [Created] `frontend/tests/e2e/filters/founding-year-modal.spec.ts` — added E2E coverage for Founding Year modal open/render, valid apply persistence, open-ended max handling, and invalid-range apply disabling
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — experience slider cards no longer expand on plain thumb click; expansion now triggers only after actual range change from defaults (`min > 0` or `max < 20`)
- [Changed] `frontend/tests/e2e/filters/experience-modal.spec.ts` — added coverage for non-expanding thumb clicks at default and expansion thresholds (`0→1` / `20→19`)
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — replaced native overlapping range-pointer interaction with explicit full-circle thumb drag handlers (`pointerdown/move/up` on visible thumb buttons) so users can drag from any point on the bubble and both min/max thumbs move smoothly and independently
- [Changed] `frontend/src/index.css` — increased experience slider thumb hit-area (`40px`) and added near-transparent painted thumb background so pointer cursor appears reliably across the full circular thumb edge/arc while dragging
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — standardized typography in Salary, Commitment, and Experience modals to match Departments (`text-lg` modal title; `text-sm` for body/labels/inputs/actions with modal `font-sans`)

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

---

## [0.4.0] — 2026-05-03 · Dark Mode + Job Card Hover Overlay + Base Card Redesign

### Dark Mode

- [Changed] `frontend/src/components/layout/HeaderMenu.tsx` — replaced separate Sun/Moon buttons with single pill toggle (label + icon pair inside rounded pill) matching hiring.cafe design; moved toggle below `border-t border-border` divider
- [Changed] `frontend/src/components/layout/Header.tsx` — removed `ThemeToggle` component; replaced hardcoded `bg-white border-b border-gray-100` with `bg-background border-b border-border`
- [Changed] `frontend/src/components/layout/FilterBar.tsx` — replaced `border-gray-100 bg-white` with `border-border bg-background`; `text-gray-300` separator → `text-border`
- [Changed] `frontend/src/components/layout/Footer.tsx` — all hardcoded gray tokens replaced with semantic: `border-border`, `text-muted-foreground`, `text-foreground`
- [Changed] `frontend/src/components/layout/MobileNav.tsx` — `bg-white border-gray-100` → `bg-background border-border`; gray text tokens → `text-muted-foreground hover:text-foreground`
- [Changed] `frontend/src/components/jobs/JobCarousel.tsx` — skeleton and scroll button colors replaced with semantic tokens; `border-gray-100` → `border-border`
- [Changed] `frontend/src/components/search/SearchBar.tsx` — `bg-gray-100` → `bg-muted`; gray text → `text-muted-foreground` / `text-foreground`
- [Changed] `frontend/src/components/filters/FilterChip.tsx` — inactive chip border/text → semantic tokens
- [Changed] `frontend/src/components/search/LocationPill.tsx` — gray border/text/hover → semantic tokens
- [Changed] `frontend/src/components/filters/FilterModal.tsx` — all hardcoded gray colors → semantic tokens; `bg-background text-foreground` added to search input
- [Changed] `frontend/src/components/jobs/JobCard.tsx` — workplace badges use explicit `dark:bg-*-950 dark:text-*-300` variants since they use raw Tailwind colors; all base card colors → semantic tokens

### Job Store Extension

- [Changed] `frontend/src/store/useJobStore.ts` — added `appliedJobIds: string[]`, `markApplied(id: string)`, `isJobApplied(id: string)` using same persist pattern as `savedJobIds`

### Job Card Hover Overlay

- [Changed] `frontend/src/components/jobs/JobCard.tsx` — added `JobCardHover` sub-component (always-dark `bg-neutral-700`, white text throughout); hover state triggers a `bg-black/50` scrim (z-10) over base card + hover card (z-20) via two separate `AnimatePresence` blocks; added `Share2`, `Globe`, `BookmarkX`, `Flag` icons; actions: Share, Save/Unsave (pink toggle), Mark Applied (green when applied), Apply Directly link, Hide, Report
- [Added] `AnimatePresence` import from `framer-motion` for enter/exit animations
- [Added] `useState` import for hover state tracking

### Base Card Redesign (hiring.cafe clone)

- [Changed] `frontend/src/components/jobs/JobCard.tsx` — full base card redesign: width `w-72` → `w-[340px]`; bold navy/dark title; clock icon + timeAgo timestamp (top-right, no bookmark button in header); location as outlined `border-border` pill with `MapPin` icon; workplace/commitment as outlined pills; company logo enlarged to 70×70px (`CompanyLogo size="lg"`); body text (company description, requirements, skills) uses `text-blue-500 dark:text-blue-400`; YOE badge inline within requirements text with `border-purple-400` outline; two-row footer: (Job Posting link | View all) + (Eye+views | Bookmark+saves | Send+applications)
- [Added] `capitalize()` and `formatCommitment()` helper functions to `JobCard.tsx`
- [Added] `CompanyLogo` sub-component with `size?: 'sm' | 'lg'` prop for reuse between base card and hover card
- [Added] `Clock`, `MapPin`, `Eye`, `Send` to lucide-react imports in `JobCard.tsx`
- [Changed] `frontend/src/components/jobs/JobCarousel.tsx` — `CardSkeleton` width `w-72` → `w-[340px]`; scroll amount 300 → 340 to match new card width
- [Changed] rontend/src/components/filters/FilterModal.tsx — merged Stage & Funding Latest Round and Exclude Latest Round back into a single shared card while keeping Raised In Or After and Latest Round Amount Raised as plain sections
- [Changed] rontend/src/components/filters/FilterModal.tsx — Stage & Funding dropdown-style fields now open a menu panel with No options when the chevron or input is focused, matching expected dropdown behavior
- [Added] rontend/src/components/filters/FilterModal.tsx + rontend/src/schemas/filter.schema.ts + rontend/src/components/layout/FilterBar.tsx — added USA Federal Jobs policy card under Industry modal with 3 radio-style options (include/only/exclude), persisted industry_usajobs_policy state, and Industry chip activation when non-default policy is selected

- [Added] rontend/src/components/filters/FilterModal.tsx — added a dedicated Shifts & Schedules modal with 3 rows (Morning, Afternoon, Overnight) and per-row single-select Required/Optional/Not Indicated controls persisted to filter state
- [Changed] rontend/src/schemas/filter.schema.ts — added shift_morning, shift_afternoon, and shift_overnight enum filter fields for Shifts & Schedules
- [Changed] rontend/src/components/layout/FilterBar.tsx — Shifts & Schedules chip now highlights when any shift row filter is selected
- [Added] rontend/tests/e2e/filters/shifts-modal.spec.ts — added coverage for modal rendering, per-row single-select behavior, deselect-on-second-click, and apply persistence

- [Changed] rontend/src/components/filters/FilterModal.tsx — extended Shifts & Schedules modal with Weekend Availability and Holiday Availability sections (Required / Not Indicated / Doesn't Matter), with Doesn't Matter as neutral default and strict values persisted on Apply
- [Changed] rontend/src/schemas/filter.schema.ts — added shift_weekend_availability and shift_holiday_availability filter fields for strict availability selections
- [Changed] rontend/src/components/layout/FilterBar.tsx — Shifts chip active state now includes weekend/holiday strict availability filters
- [Changed] rontend/tests/e2e/filters/shifts-modal.spec.ts — expanded coverage for new availability sections, default neutral selection, persistence, and strict-filter clearing via Doesn't Matter

- [Changed] rontend/src/components/filters/FilterModal.tsx — added Overtime Availability radio section and Oncall Requirements checkbox section to Shifts & Schedules modal, with neutral defaults and Apply persistence
- [Changed] rontend/src/schemas/filter.schema.ts — added shift_overtime_availability and shift_oncall_requirements filter fields
- [Changed] rontend/src/components/layout/FilterBar.tsx — Shifts chip active state now includes overtime and oncall filters
- [Changed] rontend/tests/e2e/filters/shifts-modal.spec.ts — expanded shifts tests to cover overtime and oncall UI defaults/persistence

- [Added] rontend/src/components/filters/FilterModal.tsx — implemented dedicated Languages modal with Language Requirements and Exclude Language Requirements dropdown-style search fields and Apply persistence
- [Changed] rontend/src/components/layout/FilterBar.tsx — Languages chip now highlights when language include/exclude values are selected
- [Changed] rontend/src/schemas/filter.schema.ts — added language_requirements and language_exclude_requirements fields
- [Added] rontend/tests/e2e/filters/languages-modal.spec.ts — added e2e coverage for modal rendering, single-open No options dropdown behavior, persistence, and chip highlight clearing

- [Changed] rontend/src/components/filters/FilterModal.tsx — updated shared StageSearchField behavior so dropdown panels do not auto-expand on input focus; all dropdown-style modal fields now stay collapsed until explicit dropdown interaction

- [Added] rontend/src/components/filters/FilterModal.tsx — implemented Security Clearance modal with 8 options, all-selected neutral default, subset persistence, and green text styling for No explicit reference to clearance
- [Changed] rontend/src/schemas/filter.schema.ts — added security_clearance array field
- [Changed] rontend/src/components/layout/FilterBar.tsx — Security Clearance chip now highlights when a subset clearance filter is active
- [Added] rontend/tests/e2e/filters/security-modal.spec.ts — added coverage for rendering, default all-selected state, subset persistence, and neutral reselect-all behavior

- [Added] rontend/src/components/filters/FilterModal.tsx — implemented Licenses & Certifications modal with Yes/No hide toggle, include/exclude keyword dropdown-style fields, and Apply persistence
- [Changed] rontend/src/schemas/filter.schema.ts — added licenses_hide_required, licenses_keywords, and licenses_exclude_keywords fields
- [Changed] rontend/src/components/layout/FilterBar.tsx — Licenses & Certifications chip now highlights when hide toggle is active or include/exclude keywords are set
- [Added] rontend/tests/e2e/filters/licenses-modal.spec.ts — added e2e coverage for default state, single-open dropdown behavior, persistence, and chip highlight clearing

- [Added] rontend/src/components/filters/FilterModal.tsx — implemented Education modal with Associate/Bachelor/Master requirement selectors, expandable Degree Majors placeholder rows, and Apply persistence
- [Changed] rontend/src/schemas/filter.schema.ts — added ducation_associates_requirement, ducation_bachelors_requirement, and ducation_masters_requirement fields
- [Changed] rontend/src/components/layout/FilterBar.tsx — Education chip now highlights when any degree requirement is set to required or preferred
- [Added] rontend/tests/e2e/filters/education-modal.spec.ts — added e2e coverage for education modal rendering, selector behavior, majors expansion placeholder, persistence, and chip highlight clearing

- [Changed] rontend/src/components/filters/FilterModal.tsx — extended Education modal with Doctorate Degree requirement row and Doctorate Degree Majors expandable placeholder
- [Changed] rontend/src/schemas/filter.schema.ts — added ducation_doctorate_requirement field
- [Changed] rontend/src/components/layout/FilterBar.tsx — Education chip active state now includes doctorate requirement
- [Changed] rontend/tests/e2e/filters/education-modal.spec.ts — expanded education tests to assert Doctorate Degree and neutral reset across all four degree rows

- [Changed] rontend/src/components/filters/FilterModal.tsx — Education requirement buttons now have no default selected state on modal open and use circle-only pink selection (button background no longer turns pink)
- [Changed] rontend/tests/e2e/filters/education-modal.spec.ts — updated selector assertions to validate circle-only active styling instead of full-button pink background

- [Added] rontend/src/components/filters/FilterModal.tsx — implemented dedicated Job Titles & Keywords modal with editable job title terms input, boolean query textarea, pro-tip copy, and external helper link to Wikipedia boolean query docs
- [Changed] rontend/src/schemas/filter.schema.ts — added job_title_terms and job_title_boolean_query fields
- [Changed] rontend/src/components/layout/FilterBar.tsx — Job Titles & Keywords chip now highlights when terms or boolean query has value
- [Added] rontend/tests/e2e/filters/job-titles-modal.spec.ts — added e2e coverage for modal rendering, helper link URL/target/rel, persistence, and chip highlight clearing

- [Changed] rontend/src/components/filters/FilterModal.tsx — added second Technical Keywords card below Job Title Terms in Job Titles & Keywords modal, including examples input, pro-tip text, boolean query textarea, and Wikipedia boolean-query help link
- [Changed] rontend/src/schemas/filter.schema.ts — added 	echnical_keywords_terms and 	echnical_keywords_boolean_query fields
- [Changed] rontend/src/components/layout/FilterBar.tsx — Job Titles & Keywords chip active state now includes technical keywords fields
- [Changed] rontend/tests/e2e/filters/job-titles-modal.spec.ts — expanded coverage for Technical Keywords card rendering, link assertions, persistence, and clear-to-inactive behavior

- [Changed] rontend/src/components/filters/FilterModal.tsx — added Entire Job Description card below Technical Keywords in Job Titles & Keywords modal with description copy, boolean query textarea, and Wikipedia boolean-query help link
- [Changed] rontend/src/schemas/filter.schema.ts — added job_description_boolean_query field
- [Changed] rontend/src/components/layout/FilterBar.tsx — Job Titles & Keywords chip active logic now includes entire job description query
- [Changed] rontend/tests/e2e/filters/job-titles-modal.spec.ts — expanded coverage for Entire Job Description card rendering, link count/URL checks, persistence, and clear behavior
