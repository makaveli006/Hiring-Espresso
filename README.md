# ☕ HiringEspresso

> **A supercharged job discovery platform** — find your next career move with a shot of espresso-fueled speed.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🚀 What is HiringEspresso?

HiringEspresso is a **modern job board** inspired by [hiring.cafe](https://hiring.cafe). It aggregates job listings and lets you slice, filter, and discover opportunities — fast. No fluff, no clutter, just the jobs you care about.

Whether you're hunting for a **remote gig**, an **onsite role**, or something in between, HiringEspresso serves it up hot. ☕

---

## ✨ Features

- 🔍 **Smart Search** — Search by job title, company, or keyword in real time
- 🌏 **Location & Workplace Filter** — Filter by Remote, Hybrid, or Onsite anywhere in the world
- 🃏 **Horizontal Job Carousels** — Scroll through curated job collections with smooth UX
- 🏷️ **Rich Filters** — Departments, Salary, Experience, Education, Skills, Benefits & more
- 🔐 **Auth via Clerk** — Sign up / Log in with Google, GitHub, Microsoft, or email
- 📱 **Mobile-First** — Responsive layout with a bottom navigation bar on mobile
- ⚡ **Blazing Fast** — Vite + React 19 + TanStack Query for instant feedback
- 🎨 **Pixel-Perfect UI** — Tailwind CSS v4 + shadcn/ui + Framer Motion animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖼️ Frontend | React 19 + Vite + TypeScript |
| 🎨 Styling | Tailwind CSS v4 + shadcn/ui |
| 🗃️ Client State | Zustand |
| 🔄 Server State | TanStack Query |
| ✅ Validation | Zod |
| 🎬 Animations | Framer Motion |
| 🔐 Auth | Clerk |
| ⚙️ Backend | FastAPI + SQLAlchemy + Alembic |
| 🐘 Database | Supabase (PostgreSQL) |
| 📊 Logging | Loguru |
| 🐛 Error Tracking | Sentry |
| 🧪 Testing | Jest + RTL (FE), pytest (BE) |
| 🚀 Deploy | Vercel (FE) + Railway (BE) |

---

## 📁 Project Structure

```
HiringEspresso/
├── 🖥️  frontend/        # Vite + React 19 + TypeScript
│   └── src/
│       ├── components/  # UI components (Header, FilterBar, JobCard…)
│       ├── hooks/       # TanStack Query hooks
│       ├── store/       # Zustand stores
│       ├── schemas/     # Zod validation schemas
│       └── pages/       # Route-level pages
│
└── ⚙️  backend/         # FastAPI + Python (managed with uv)
    └── app/
        ├── api/         # Route handlers
        ├── services/    # Business logic
        ├── repositories/# DB queries (SQLAlchemy)
        ├── models/      # ORM models
        └── core/        # Config, auth, logging, middleware
```

---

## 🏃 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
uv sync
uvicorn app.main:app --reload  # → http://localhost:8000
```

### Environment Variables

**`frontend/.env.local`**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_BASE_URL=http://localhost:8000
VITE_SENTRY_DSN=
```

**`backend/.env`**
```env
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
CLERK_JWKS_URL=https://...clerk.accounts.dev/.well-known/jwks.json
SENTRY_DSN=
CORS_ORIGINS=http://localhost:5173
```

---

## 🎨 Design

- 🩷 Primary pink: `#e91e8c` — used on all CTAs, active filters, and badges
- 🟢 Remote badge · 🟡 Hybrid badge · 🔵 Onsite badge · 🟣 Experience badge
- Cards arranged in **horizontal scrollable carousels** per category
- Filter chips in a **scrollable row** below the header
- Auth modal with social logins (Google, GitHub, Microsoft, Facebook)

---

## 🧪 Testing

```bash
# Frontend
cd frontend && npm run test

# Backend
cd backend && pytest
```

---

## 🚢 Deployment

| Service | Platform |
|---|---|
| 🖥️ Frontend | [Vercel](https://vercel.com) — Root: `frontend/` |
| ⚙️ Backend | [Railway](https://railway.app) — Root: `backend/` |
| 🐘 Database | [Supabase](https://supabase.com) PostgreSQL |

---

## 📜 License

MIT © HiringEspresso Contributors

---

<div align="center">
  <strong>Made with ☕ and 💙 — because finding a great job shouldn't feel like a grind.</strong>
</div>
