---
name: react-js-skill
description: "React + TypeScript conventions for this project. Use when: creating components, hooks, stores, schemas, API fetchers, or pages. Covers component structure, Zustand patterns, TanStack Query v5, Zod v4 schemas, Tailwind v4 styling, Framer Motion, Clerk auth, and shadcn/ui usage specific to this codebase."
argument-hint: "Describe what you want to build (e.g. 'new filter chip component', 'Zustand store for notifications', 'TanStack Query hook for companies')"
---

# React + TypeScript — Project Conventions

## Stack at a Glance

| Concern | Library | Version |
|---------|---------|---------|
| Framework | React + Vite + TypeScript | 19 / 6 / 5 |
| Styling | Tailwind CSS v4 + shadcn/ui | 4.2.4 |
| UI primitives | `@base-ui/react` (via shadcn) | — |
| Server state | TanStack Query | 5.100.5 |
| Client state | Zustand | 5.0.12 |
| Validation | Zod | 4.3.6 |
| Animations | Framer Motion | — |
| Auth | Clerk (`@clerk/clerk-react`) | — |
| Icons | `lucide-react` | — |
| Utilities | `clsx` + `tailwind-merge` via `cn()` | — |

Path alias: `@/` → `src/`

---

## Directory Layout

```
src/
├── api/           # Raw fetch functions (NOT hooks)
│   ├── client.ts  # apiFetch wrapper, api.get/post/delete
│   └── jobs.ts    # fetchJobs, fetchJob, saveJob, etc.
├── components/
│   ├── auth/      # AuthModal.tsx
│   ├── filters/   # FilterChip.tsx, FilterModal.tsx
│   ├── jobs/      # JobCard.tsx, JobCarousel.tsx
│   ├── layout/    # Header, FilterBar, Footer, MobileNav
│   ├── search/    # SearchBar, LocationPill
│   └── ui/        # shadcn primitives (DO NOT modify)
├── data/          # mockJobs.ts (dev only)
├── hooks/         # TanStack Query hooks + custom hooks
├── layouts/       # RootLayout.tsx
├── lib/           # utils.ts (cn())
├── pages/         # HomePage.tsx (one page per route)
├── schemas/       # Zod schemas → exported types
└── store/         # Zustand stores
```

---

## Component Conventions

### Exports
- **Feature components** → **named export**: `export function Header() {}`
- **Pages** → named export: `export function HomePage() {}`
- **App.tsx** → default export (only exception)
- **`ui/` components** → named export matching shadcn pattern

### Props Typing
```tsx
// Multi-prop component → interface
interface JobCardProps {
  job: Job;
  index?: number;
}
export function JobCard({ job, index = 0 }: JobCardProps) {}

// Simple/single-prop → inline type
export function JobCarousel({ title, jobs, isLoading = false }: {
  title: string;
  jobs: Job[];
  isLoading?: boolean;
}) {}
```

### Sub-components
Define helper components in the **same file** when used only locally:
```tsx
// ✅ CardSkeleton defined inside JobCarousel.tsx
function CardSkeleton() {
  return <Skeleton className="w-72 h-48 shrink-0 rounded-xl" />;
}
```

### No Class Components
100% functional components with hooks only.

### No Enums
Use string literals for all variants:
```tsx
// ✅ Correct
workplace_type: "remote" | "hybrid" | "onsite"

// ❌ Wrong
enum WorkplaceType { Remote = "remote" }
```

---

## Styling Conventions

### Tailwind v4 Setup
- Config lives in `src/index.css` inside `@theme { }` — **no `tailwind.config.js`**
- Primary pink: `oklch(0.558 0.243 351.3)` = `#e91e8c`
- Font: Geist Variable (`@fontsource-variable/geist`)
- Animations via `tw-animate-css`

### `cn()` for All Class Merging
```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex items-center gap-2", isActive && "text-pink-600")} />
```

### Color Tokens (never raw colors for UI state)
```tsx
// ✅ Semantic tokens
<div className="bg-background text-foreground" />
<p className="text-muted-foreground" />

// ❌ Raw colors for status
<span className="text-green-600">Active</span>
```

### Badge Colors (project-specific)
```tsx
const WORKPLACE_STYLES = {
  remote:  "bg-green-50 text-green-700 border-green-200",
  hybrid:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  onsite:  "bg-blue-50 text-blue-700 border-blue-200",
};
// YOE badge: bg-purple-50 text-purple-700
```

### Layout Constraints
- Max width wrapper: `max-w-7xl mx-auto px-4`
- Main content padding: `py-6 pb-20 md:pb-6` (extra bottom for MobileNav)
- Card width: `w-72 shrink-0` (288px fixed)

---

## TanStack Query Patterns (v5)

### Hook Location
All TanStack Query hooks live in `src/hooks/useJobs.ts`. Add new entity hooks to the same file or create `hooks/use<Entity>.ts`.

### Query Key Convention
```ts
['jobs', filters]           // infinite job list
['job', id]                 // single job
['jobs-carousel', filters]  // fixed-filter carousel
['saved-jobs']              // user saved jobs
['companies']               // (future)
```

### Standard Query Hook
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "@/api/jobs";

export function useJobsForCarousel(filters: Partial<JobFilters>) {
  return useQuery({
    queryKey: ["jobs-carousel", filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 60_000,
    select: (data) => data.items,  // extract only what component needs
  });
}
```

### Infinite Query (cursor-based pagination)
```ts
export function useInfiniteJobs() {
  const { filters } = useFilterStore();
  return useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: ({ pageParam }) => fetchJobs(filters, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    staleTime: 60_000,
  });
}
```

### Mutation with Store Sync
```ts
export function useSaveJob() {
  const queryClient = useQueryClient();
  const { saveJob: saveToStore, unsaveJob: unsaveFromStore } = useJobStore();

  const save = useMutation({
    mutationFn: (id: string) => saveJobApi(id),
    onSuccess: (_, id) => {
      saveToStore(id);                             // update Zustand immediately
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });

  const unsave = useMutation({
    mutationFn: (id: string) => unsaveJobApi(id),
    onSuccess: (_, id) => {
      unsaveFromStore(id);
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
    },
  });

  return { save, unsave };
}
```

### QueryClient Config (set in `main.tsx`)
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2, gcTime: 5 * 60 * 1000 },
  },
});
```

---

## Zustand Store Patterns

### File Location & Naming
`src/store/use<Entity>Store.ts` — the file name IS the hook name.

### Standard Store Template
```ts
import { create } from "zustand";

interface MyStore {
  // state
  items: string[];
  isOpen: boolean;
  // actions
  addItem: (item: string) => void;
  setOpen: (open: boolean) => void;
  reset: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  isOpen: false,

  addItem: (item) =>
    set((state) => ({ items: [...new Set([...state.items, item])] })),

  setOpen: (open) => set({ isOpen: open }),

  reset: () => set({ items: [], isOpen: false }),
}));
```

### With `persist` Middleware (for user preferences)
```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      saveJob: (id) =>
        set((s) => ({ savedJobIds: [...new Set([...s.savedJobIds, id])] })),
      isJobSaved: (id) => get().savedJobIds.includes(id),
    }),
    { name: "job-store" }  // localStorage key
  )
);
```

### Functional setState for Array/Derived Updates
```ts
// ✅ Always use functional form when reading current state
addItem: (item) => set((state) => ({ items: [...state.items, item] })),

// ❌ Stale closure risk
addItem: (item) => set({ items: [...items, item] }),
```

### Existing Stores Summary
| Store | Purpose | Persisted |
|-------|---------|-----------|
| `useFilterStore` | Active search/filter state | No |
| `useJobStore` | Saved + hidden job IDs | Yes (`job-store`) |
| `useUIStore` | Modal open states | No |

---

## Zod Schema Conventions

### File Location
`src/schemas/<entity>.schema.ts`

### Pattern: Schema → Inferred Type
```ts
import { z } from "zod";

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

export type Company = z.infer<typeof companySchema>;

export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: companySchema,
  workplace_type: z.string().nullable().optional(),
  posted_at: z.string(),
  // ... all other fields nullable/optional except id, title, company, posted_at
});

export type Job = z.infer<typeof jobSchema>;

export const jobListResponseSchema = z.object({
  items: z.array(jobSchema),
  next_cursor: z.string().nullable().optional(),
  total: z.number().optional(),
});

export type JobListResponse = z.infer<typeof jobListResponseSchema>;
```

### Validate API Responses in the Fetcher
```ts
// api/jobs.ts
export async function fetchJobs(filters: Partial<JobFilters>, cursor?: string) {
  const data = await api.get(`/jobs?${buildQuery(filters, cursor)}`);
  return jobListResponseSchema.parse(data);  // throws if shape is wrong
}
```

### Env Validation at Startup
`src/schemas/env.schema.ts` validates `import.meta.env` — if `VITE_CLERK_PUBLISHABLE_KEY` or `VITE_API_BASE_URL` are missing, the app throws immediately on load.

---

## API Layer Conventions

### Two Layers: `api/` vs `hooks/`
- `api/` — raw async functions, no React, no state. Accept params, return validated data.
- `hooks/` — TanStack Query wrappers. Import from `api/`, expose to components.

### API Client (`api/client.ts`)
```ts
// Use the pre-built helpers — don't call fetch() directly in components
import { api } from "@/api/client";

await api.get("/jobs?limit=20");
await api.post("/jobs/save", { jobId: "abc" });
await api.delete(`/jobs/save/${id}`);
```

The client:
- Reads `VITE_API_BASE_URL` from validated env
- Attaches Clerk JWT from `window.__clerkToken`
- Throws on non-ok responses with the API's `detail` message

---

## Framer Motion Conventions

Only used in `JobCard.tsx` for staggered entrance. Pattern to follow for new animated lists:

```tsx
import { motion } from "framer-motion";

// In the component
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.04 }}
  className="..."
>
  {/* card content */}
</motion.div>
```

- Keep delay multiplier ≤ `0.06` for lists (avoids visible lag on large carousels)
- Wrap SVG animations in a `<div>`, not on `<svg>` directly (hardware acceleration)

---

## Clerk Auth Conventions

### Provider (already in `main.tsx` — don't touch)
```tsx
<ClerkProvider publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}>
```

### Conditional Rendering in Components
```tsx
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

<SignedOut>
  <button onClick={() => setAuthModalOpen(true)}>Sign In</button>
</SignedOut>
<SignedIn>
  <UserButton afterSignOutUrl="/" />
</SignedIn>
```

### Auth Modal
`AuthModal.tsx` uses Clerk's `<SignIn>` component inside a shadcn `Dialog`. Open via `useUIStore`:
```tsx
const { setAuthModalOpen } = useUIStore();
setAuthModalOpen(true);
```

---

## shadcn/ui Conventions

### Import From `@/components/ui/`
```tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
```

### Available Components
`badge`, `button`, `card`, `checkbox`, `dialog`, `input`, `scroll-area`, `separator`, `skeleton`

### Adding New Components
```bash
cd frontend
npx shadcn@latest add <component-name>
```

### Icons in Buttons
```tsx
// ✅ Use data-icon, no sizing classes
<Button>
  <BookmarkIcon data-icon="inline-start" />
  Save
</Button>

// ❌ No manual mr-2 size-4
<Button>
  <BookmarkIcon className="mr-2 size-4" />
  Save
</Button>
```

---

## Lucide Icons Convention

Always import from `lucide-react` (the project's configured icon library):
```tsx
import { Bookmark, TrendingUp, ExternalLink, FileText, Wrench } from "lucide-react";
```

No sizing classes inside components — let the container or `data-icon` control size.

---

## Provider Stack (`main.tsx`)

```
StrictMode
  └── ClerkProvider
        └── QueryClientProvider
              └── App
                    └── RootLayout
                          └── Page
```

Add new global providers **inside** `QueryClientProvider` but **outside** `App` if they need query access, otherwise wrap at `App` level.

---

## Global Modals Pattern

Modals that appear from anywhere (`FilterModal`, `AuthModal`) are:
1. Rendered once in `RootLayout.tsx`
2. Open/close state lives in `useUIStore`
3. Open them from any component via `useUIStore` setters

```tsx
// In RootLayout.tsx
<FilterModal />   // reads activeFilterModal from UIStore
<AuthModal />     // reads authModalOpen from UIStore

// In any component
const { setAuthModalOpen } = useUIStore();
<button onClick={() => setAuthModalOpen(true)}>Log in</button>
```

---

## TypeScript Patterns

```ts
// ✅ interface for props and store shapes
interface JobCardProps { job: Job; index?: number }

// ✅ type for Zod-inferred types
export type Job = z.infer<typeof jobSchema>;

// ✅ Generic key-value setter
setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;

// ✅ import type for type-only imports
import type { Job } from "@/schemas/job.schema";

// ✅ Optional chaining + nullish coalescing
job.skills?.join(", ") ?? "No skills listed"

// ❌ No enums — use string literals
```

---

## Custom Hooks (`hooks/`)

### `useDebounce<T>`
```ts
import { useDebounce } from "@/hooks/useDebounce";

const debouncedQuery = useDebounce(searchQuery, 300);
```

### Creating a New Custom Hook
```ts
// hooks/use<Entity>.ts
export function useMyCustomHook(param: string) {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    // side effect
  }, [param]);   // ✅ narrow deps — use primitives not objects

  return { state };
}
```

---

## Performance Checklist for New Components

- [ ] Helper components defined **outside** the parent component (not inline) to avoid remounting
- [ ] Static lookup objects (`WORKPLACE_STYLES`, chip arrays) defined at **module level**, not inside render
- [ ] `useCallback` / `useMemo` only when computation is genuinely expensive (not for simple expressions)
- [ ] Scroll/touch event listeners use `{ passive: true }`
- [ ] Carousel/list uses `overflow-x-auto scrollbar-hide` with `scrollBy({ behavior: 'smooth' })`
- [ ] Framer Motion delay ≤ `index * 0.06`

---

## File Creation Checklist

When adding a new feature (e.g., "company detail page"):

1. **Schema** → `src/schemas/company.schema.ts`  
   Add Zod schema + export inferred type

2. **API fetcher** → `src/api/companies.ts`  
   Raw async function, validate response with schema

3. **Hook** → `src/hooks/useCompanies.ts`  
   TanStack Query wrapper; add to existing file if entity already exists

4. **Store** (if needed) → `src/store/useCompanyStore.ts`  
   Zustand store; use `persist` only for user preferences

5. **Component** → `src/components/jobs/CompanyCard.tsx` or appropriate subfolder  
   Named export, `interface` for props

6. **Page** → `src/pages/CompanyPage.tsx`  
   Named export, compose from components + hooks

7. **Wire into layout** → Add to `RootLayout.tsx` or `App.tsx`
