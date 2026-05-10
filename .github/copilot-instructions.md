# Hiring Espresso — HiringCafe Clone

## Git Branching — CRITICAL

**Never merge directly into `main`.** `main` is the production branch and is only updated via release or hotfix merges.

- All feature branches must be created from `develop` and merged back into `develop`
- `develop` → QA/staging; `main` → production only

```
feature/xxx  →  develop  →  (release branch)  →  main
```

---

## Brand Name — CRITICAL

**Never rename the brand from `Hiring Espresso`.** This is the project's own brand name — do not replace it with `HiringCafe`, `hiring.cafe`, or any other name. The reference site is only used for design inspiration; the product identity is always `Hiring Espresso`.

---

## Project Structure

```
Hiring-Espresso/
├── frontend/          # Vite + React 19 + TypeScript
└── backend/           # FastAPI + Python (managed with uv)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4.2.4 + shadcn/ui |
| State (client) | Zustand 5.0.12 |
| State (server) | TanStack Query 5.100.5 |
| Validation | Zod 4.3.6 |
| Animations | Framer Motion |
| Auth | Clerk |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | Supabase (PostgreSQL) |
| Logging | loguru (backend) |
| Error tracking | Sentry (both) |
| Rate limiting | slowapi |
| Testing | Jest 30 + RTL (FE), pytest (BE) |
| CI/CD | GitHub Actions |
| Deploy | Vercel (FE) + Railway/Render (BE) |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint
npm run test
```

## E2E Testing — CRITICAL

**Always run Playwright tests with Chromium only.** Firefox and WebKit are not installed.

```bash
npx playwright test --project=chromium          # all tests
npx playwright test --project=chromium <file>   # specific file
```

Never add Firefox, WebKit, mobile-chrome, or mobile-safari to `playwright.config.ts` projects. The config must only contain the `chromium` project.

**Path alias:** `@/` resolves to `src/`

**Key directories:**
- `src/components/layout/` — Header, FilterBar, Footer, MobileNav
- `src/components/jobs/` — JobCard, JobCarousel
- `src/components/filters/` — FilterChip, FilterModal
- `src/components/search/` — SearchBar, LocationPill
- `src/components/auth/` — AuthModal
- `src/components/ui/` — shadcn primitives
- `src/store/` — Zustand stores (useFilterStore, useJobStore, useUIStore)
- `src/hooks/` — TanStack Query hooks + custom hooks
- `src/api/` — API client + typed fetchers
- `src/schemas/` — Zod schemas for jobs, filters, env
- `src/layouts/` — RootLayout

## Backend Setup

```bash
cd backend
uv venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac
uv add <package>                # install new packages
uvicorn app.main:app --reload   # http://localhost:8000
pytest                          # run tests
```

**Key directories:**
- `app/api/` — route handlers (thin, no business logic)
- `app/services/` — business logic
- `app/repositories/` — SQLAlchemy DB queries
- `app/models/` — ORM models (Job, Company, User, SavedJob, HiddenJob)
- `app/schemas/` — Pydantic request/response schemas
- `app/core/` — config, security (Clerk JWT), logging, middleware
- `alembic/` — DB migrations
- `tests/` — pytest tests

## UI Development Guidelines

When making UI changes, ensure the following are consistent with the design reference:

- Spacing and padding match the reference (primary pink `#e91e8c` on all CTAs, active filters, badges)
- Font sizes, weights, and line heights are correct
- Badge colors: remote=green, hybrid=yellow, onsite=blue, YOE=purple
- Border radii, shadows, and card layouts match
- Carousel scroll behavior and arrow buttons work correctly
- Filter chip row is horizontally scrollable

To preview changes, run `cd frontend && npm run dev` and open `http://localhost:5173`.

---

## Key Conventions

### Frontend
- Tailwind v4: configured via `@tailwindcss/vite` plugin + `@theme` in `src/index.css`; no `tailwind.config.js`
- Pink primary: `oklch(0.558 0.243 351.3)` = `#e91e8c`
- Use shadcn components from `src/components/ui/` for all primitives
- All API calls go through TanStack Query hooks in `src/hooks/`
- Zod schemas validate all API responses and env vars at startup
- Framer Motion for card entrance animations and modal transitions
- Modal typography standard (all modals):
  - Font family: `font-sans` (`Geist Variable`)
  - Modal title: `text-lg` (18px)
  - Modal body text, labels, inputs, action text: `text-sm` (14px)
  - Small selected chips/tags inside modals: `text-xs` (12px)
- **Dark mode colors**: Never use inline `style={{ color: '...' }}` for text — it overrides Tailwind's dark mode classes. Always use semantic tokens: `text-foreground` (headings / dark text that becomes white in dark mode), `text-muted-foreground` (body / gray text). These auto-switch via CSS variables. Brand/accent colors (e.g. `#DD6B20`, `#319795`) may use `text-[#hex]` with a `dark:` variant.

### Backend
- Routes in `app/api/` must be thin — delegate to service layer
- All DB queries isolated in `app/repositories/`
- Auth: verify Clerk JWT in `app/core/security.py` using JWKS endpoint
- Pagination: cursor-based (`?cursor=<job_id>&limit=20`)
- Indexes on `posted_at`, `workplace_type`, `location_country`

## Environment Variables

### Frontend (`frontend/.env.local`)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_BASE_URL=http://localhost:8000
VITE_SENTRY_DSN=
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
CLERK_JWKS_URL=https://...clerk.accounts.dev/.well-known/jwks.json
SENTRY_DSN=
CORS_ORIGINS=http://localhost:5173
```

## Design Reference

The UI clones hiring.cafe. Key design decisions:
- Primary pink: `#e91e8c` on all CTAs, active filters, badges
- Job cards displayed in horizontal carousels with scroll buttons
- Filter chips in a scrollable row below the header
- Location & Environments modal with Workplace Type / Physical environment checkboxes
- Auth via Clerk modal (email + social: Google, Microsoft, Facebook, GitHub)
- Bottom navigation bar on mobile (Home, Saved, Messages, Profile)

## Deployment

- **Frontend:** Vercel — `Root Directory: frontend`
- **Backend:** Railway/Render — `Root Directory: backend`, start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Database:** Supabase PostgreSQL
