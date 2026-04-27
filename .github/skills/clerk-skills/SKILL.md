---
name: clerk-skills
description: "Clerk authentication for this project (React 19 + Vite SPA + FastAPI backend). Use when: adding auth, setting up ClerkProvider, using useAuth/useUser/useClerk hooks, protecting routes, getting JWT tokens for API calls, custom sign-in/sign-up UI, appearance/theming, webhooks (user.created, user.updated, user.deleted), syncing Clerk users to database, verifying Clerk JWT in FastAPI backend, organizations/multi-tenant, Clerk environment variables (VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY), sign-in modal, sign-out, session, auth guard."
argument-hint: "Describe the auth task (e.g. 'protect a route', 'get JWT for API call', 'handle user.created webhook', 'custom sign-in form', 'verify token in FastAPI')"
---

# Clerk Authentication

This project uses **React 19 + Vite SPA** with `@clerk/react` on the frontend and **FastAPI** on the backend. There is no Next.js — all auth is client-side via hooks.

---

## Project-Specific Setup

**Package**: `@clerk/react` (not `@clerk/nextjs`)  
**Env var**: `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`  
**Backend env**: `CLERK_SECRET_KEY`, `CLERK_JWKS_URL` in `backend/.env`  
**Provider**: Already wrapped in `src/main.tsx` via `ClerkProvider`

---

## Core Hooks (`@clerk/react`)

Always guard on `isLoaded` before trusting `isSignedIn`:

```tsx
import { useAuth, useUser, useClerk } from '@clerk/react'

// Auth state — isLoaded MUST be true before checking isSignedIn
const { isLoaded, isSignedIn, userId, getToken } = useAuth()

// Full user object
const { isLoaded, isSignedIn, user } = useUser()

// Methods: signOut, openSignIn, openUserProfile
const { signOut, openSignIn } = useClerk()
```

**Minimal guard pattern:**

```tsx
const { isLoaded, isSignedIn } = useAuth()
if (!isLoaded) return <Spinner />
if (!isSignedIn) return <Navigate to="/sign-in" replace />
```

---

## Getting JWT for Backend API Calls

```tsx
import { useAuth } from '@clerk/react'

function useApiClient() {
  const { getToken } = useAuth()

  return async function apiFetch(url: string, options?: RequestInit) {
    const token = await getToken()
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }
}
```

With TanStack Query (project pattern — all API calls go through `src/hooks/`):

```tsx
import { useAuth } from '@clerk/react'
import { useQuery } from '@tanstack/react-query'

export function useJobs(filters) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const token = await getToken()
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/jobs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      return res.json()
    },
  })
}
```

---

## Protected Route (React Router)

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/react'

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <Spinner />
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  return <Outlet />
}
```

---

## Sign In / Sign Out UI

Use Clerk's pre-built components (project uses AuthModal pattern):

```tsx
import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from '@clerk/react'

// Show/hide based on auth state
<SignedOut>
  <button onClick={() => openSignIn()}>Sign In</button>
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

For a modal (project's `AuthModal.tsx` pattern):

```tsx
import { useClerk } from '@clerk/react'

export function AuthModal() {
  const { openSignIn } = useClerk()
  return <button onClick={() => openSignIn()}>Sign In</button>
}
```

---

## Appearance / Theming

Match the project's primary pink (`#e91e8c`):

```tsx
<ClerkProvider
  publishableKey={PUBLISHABLE_KEY}
  appearance={{
    variables: {
      colorPrimary: '#e91e8c',
      colorBackground: '#ffffff',
      borderRadius: '0.5rem',
    },
  }}
>
```

---

## Backend: Verify Clerk JWT in FastAPI

Located in `backend/app/core/security.py`. Pattern uses JWKS endpoint:

```python
import httpx
from jose import jwt, JWTError
from app.core.config import settings

async def verify_clerk_token(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        jwks = (await client.get(settings.clerk_jwks_url)).json()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
```

FastAPI dependency:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict | None:
    if not credentials:
        return None
    try:
        return await verify_clerk_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
```

---

## Webhooks (user sync to DB)

Used to sync Clerk users into the `users` table in Supabase. The backend exposes a `/webhooks/clerk` route:

**ALWAYS verify webhook signatures** using `svix`:

```python
from svix.webhooks import Webhook, WebhookVerificationError
from fastapi import Request, HTTPException

WEBHOOK_SECRET = settings.clerk_webhook_secret  # from Clerk dashboard

async def verify_clerk_webhook(request: Request) -> dict:
    payload = await request.body()
    headers = dict(request.headers)
    try:
        wh = Webhook(WEBHOOK_SECRET)
        return wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
```

Event handler pattern:

```python
@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    evt = await verify_clerk_webhook(request)
    event_type = evt["type"]

    if event_type == "user.created":
        data = evt["data"]
        email = data["email_addresses"][0]["email_address"]
        user_service.create_user(db, clerk_id=data["id"], email=email)

    elif event_type == "user.deleted":
        user_service.delete_user(db, clerk_id=evt["data"]["id"])

    return {"status": "ok"}
```

---

## Common Pitfalls

| Symptom | Cause | Fix |
|---------|-------|-----|
| `isSignedIn` is `undefined` | `isLoaded` is `false` | Always check `isLoaded` first |
| `import.meta.env.VITE_*` is `undefined` | Wrong prefix or missing in `.env.local` | Must be `VITE_` prefix, in `frontend/.env.local` |
| Token is `null` | User not signed in | Null-check `getToken()` result |
| FastAPI returns 401 | Token expired or wrong JWKS URL | Check `CLERK_JWKS_URL` in `backend/.env` |
| Webhook returns 401 | Route not public | Exclude `/webhooks/*` from auth middleware |

---

## Sub-Skill References

For deeper detail, read these nested skill files:

- [`core/clerk/SKILL.md`](core/clerk/SKILL.md) — skill router, version detection
- [`core/clerk-setup/SKILL.md`](core/clerk-setup/SKILL.md) — initial installation, quickstarts
- [`core/clerk-custom-ui/SKILL.md`](core/clerk-custom-ui/SKILL.md) — custom flows, appearance
- [`frameworks/clerk-react-patterns/SKILL.md`](frameworks/clerk-react-patterns/SKILL.md) — full React SPA patterns
- [`features/clerk-webhooks/SKILL.md`](features/clerk-webhooks/SKILL.md) — webhook handlers
- [`features/clerk-orgs/SKILL.md`](features/clerk-orgs/SKILL.md) — organizations/multi-tenant
- [`features/clerk-testing/SKILL.md`](features/clerk-testing/SKILL.md) — Playwright/Cypress testing
