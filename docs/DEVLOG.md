# BusinessOS: Development Log

Chronological. Newest entries at the bottom. Each entry: work completed, decisions, problems, tests, next steps. Only record verified facts.

---

## 2026-11-15: Session 1: Planning and scaffold

**Work completed**
- Inspected environment: Node v26.13.0, npm 11.20.0, git 2.56.0; target directory contained other coursework (left untouched); created `businessos/` as its own git repo.
- Scaffolded Next.js (`create-next-app`: TypeScript, Tailwind, ESLint, App Router, `src/`, `@/*` alias, npm, Turbopack).
- Initialized shadcn/ui; added `card badge separator sheet tooltip skeleton`. Installed `recharts`, `lucide-react`, `vitest`, `@playwright/test` (+ Chromium).
- Built app shell: responsive sidebar (desktop) / sheet nav (mobile), theme toggle with no-flash init script, `(app)` route group with `loading.tsx` and `error.tsx`, nine placeholder module routes labeled "Planned", dashboard with KPI cards rendering "—" (no fake numbers).
- Wrote `src/lib/money.ts` (integer-cent format/parse) with unit tests.
- Wrote draft schema + RLS in `supabase/migrations/0001_initial_schema.sql` (**not applied**; no Supabase project exists yet).
- Wrote CLAUDE.md, PRD, ARCHITECTURE, ROADMAP, DECISIONS, this log.

**Technical decisions** (details in DECISIONS.md)
- Modular monolith; pure domain functions; server-derived business context + RLS; integer cents; composite FKs; derived data computed on demand.
- Deferred installing `@supabase/*` and `zod` to Phase 1 (not needed by the scaffold).
- Used `next.config.ts` `redirects` for `/` → `/dashboard` instead of a `redirect()` page, which logged a prerender error in dev under `cacheComponents`.

**Problems encountered**
- `npm i vitest ...` failed with ERESOLVE: Vitest 5 needs `@types/node` ≥ 22; scaffold had ^20. Fixed by bumping `@types/node` to ^24. Dropped unneeded extras (jsdom, testing-library, vite-tsconfig-paths, plugin-react) to keep dependencies minimal.
- shadcn generated `import { cn } from "cn"`. Verified via `npm view` that the package is maintained by the shadcn team before keeping it.
- Vite warned about ESM config in `vitest.config.ts`; renamed to `.mts`.
- `npm audit`: 7 moderate advisories, all in the shadcn CLI dependency tree; no non-breaking fix. Logged in ADR-008.
- A bash heredoc containing the SQL file failed (quoting); wrote the file with the editor tool instead.

**Tests performed (all run, results observed)**
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm test` (Vitest): 1 file, 5 tests passed
- `npm run build`: succeeded; all routes prerendered as static
- `npx playwright test` (desktop + mobile Chromium): 6 passed (root redirect, no fabricated numbers on dashboard, navigation reaches all nine modules)
- Manual visual check via screenshots (desktop light, mobile dark): layout renders correctly
- **Not tested:** the SQL migration has not been executed against any Postgres; RLS is unverified until Phase 1.

**Next steps**
- Get owner decisions on the three open items in DECISIONS.md.
- Phase 1: Supabase project, apply migration, auth, onboarding, RLS tests.
