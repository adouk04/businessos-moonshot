# CLAUDE.md: BusinessOS

@AGENTS.md

Guidance for Claude Code sessions in this repository. Keep this file accurate; update the **Current status** section at the end of every session.

## Product

**BusinessOS: "Manage smarter. Grow faster."** A SaaS platform for owners of appointment-based small service businesses (barbershops, salons, detailing, cleaning). It combines lightweight management (customers, services, appointments, sales, expenses, metrics) with growth intelligence (missed-revenue detection, pricing simulation, experiments, decision log). Loop: Manage → Analyze → Discover → Simulate → Experiment → Measure → Learn.

This is the TCSS 490 Artifact 5 "Moonshot" project (UW Tacoma) **and** the seed of a real product. Demo **Dec 7, 2026**; final submission **Dec 13, 2026**. Build for long-term maintainability, not a throwaway.

Docs: `docs/PRD.md` (what/why), `docs/ARCHITECTURE.md` (how), `docs/ROADMAP.md` (tasks), `docs/DECISIONS.md` (ADRs + risks + open decisions), `docs/DEVLOG.md` (chronological log).

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Recharts · Lucide · Zod (Phase 1) · Supabase (Postgres + Auth + RLS) via `@supabase/ssr` (Phase 1) · Vitest · Playwright · Vercel + Supabase deploy. AI (Claude/OpenAI) only as an optional stretch for *explaining* results.

**Next.js 16 differs from older versions** (e.g. `middleware` → `proxy.ts`; `cacheComponents` is enabled). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code.

## Architecture in brief

Modular monolith. Layers (see ARCHITECTURE.md §2): `app/` (thin routes) → `components/` (UI) → `server/` (auth, db access, actions) → `domain/` (pure business logic, no framework imports) + `lib/` + `schemas/`.

## Repository structure

```
src/app/(app)/…     Authenticated shell + module routes (currently placeholders)
src/components/     ui/ (shadcn), layout/ (sidebar, mobile nav, theme), shared (page-header, kpi-card, planned-feature)
src/config/nav.ts   Navigation single source of truth
src/lib/            money.ts (+ tests), utils.ts
src/domain/         (Phase 2+) pure calculations and rules
src/server/         (Phase 1+) requireBusiness(), db access, server actions
src/schemas/        (Phase 1+) Zod schemas
supabase/migrations/ SQL migrations (0001 is a DRAFT, not applied)
e2e/                Playwright specs
docs/               Project documentation
```

## Commands (Windows; run from repo root)

```
npm run dev            # dev server (http://localhost:3000)
npm run build          # production build
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Vitest (unit/integration), single run
npm run test:watch     # Vitest watch
npm run test:e2e       # Playwright (starts its own dev server on :3100; desktop + mobile)
```

Run `typecheck`, `lint`, `test` before every commit; run `test:e2e` after UI/route changes.

## Conventions

- **Money is integer cents.** Use `src/lib/money.ts`. Never `parseFloat`, never floats for money.
- **Business logic goes in `src/domain/` as pure functions** with unit tests. No calculations in React components.
- **Every tenant table has `business_id` and RLS.** Never accept a business ID from the client without verifying membership server-side. Derive it from the session.
- **Validate all external input with Zod** in server actions/route handlers.
- **No fabricated data in the UI.** Show empty states or "—". Demo data lives only in the seed script.
- **Honest labels:** estimates are "estimates, not guaranteed"; simulations are "hypothetical"; operating surplus is **not** accounting net profit; an experiment's before/after change does not prove causation.
- **AI never calculates and never writes SQL.** Calculations are deterministic domain functions.
- Server Components by default; `"use client"` only where needed. Reuse components; avoid speculative abstractions.
- Keep dependencies minimal; ask before adding anything non-trivial.
- Commits: small, imperative subject, one logical change. Keep this file and `docs/DEVLOG.md` updated alongside code.

## Security requirements

- Server-side authorization on every data access (`requireBusiness()` pattern); RLS as second layer; `proxy.ts` is only an optimistic redirect.
- Secrets only in `.env.local` (git-ignored); document names in `.env.example`. Service-role key is server-only and not used in user request paths. Never prefix secrets with `NEXT_PUBLIC_`.
- User-safe error messages; no stack traces/SQL to clients.
- Do not contact customers automatically. Do not deploy publicly, enable paid services, or create cloud projects without the owner's explicit approval.

## Working rules for Claude

1. Inspect before changing; don't overwrite existing work.
2. Work in small, independently testable increments; run relevant tests after each.
3. **Never claim tests pass, or a feature/deployment works, without running/verifying it.** Record untested items explicitly.
4. Keep "implemented" vs "planned" clearly separated (status below, PRD legend).
5. Ask only when a decision materially affects architecture, cost, security, or scope; otherwise choose a sensible default and record it in DECISIONS.md.
6. When blocked, explain the issue and recommend the smallest practical solution.

## Current status (update every session)

Last updated: 2026-11-15 (Session 1, Milestone 1 in progress)

| Area | Status |
|---|---|
| Docs (PRD, ARCHITECTURE, ROADMAP, DECISIONS, DEVLOG) | Implemented |
| Next.js scaffold, Tailwind, shadcn/ui, Recharts, Lucide | Implemented |
| App shell: sidebar, mobile nav, theme toggle, loading/error | Implemented (verified earlier by e2e + screenshots) |
| Zod schemas + validation tests (auth, business) | Implemented, unit tested |
| `src/lib/money.ts` | Implemented + unit tested |
| Auth (login/register/logout), onboarding, `proxy.ts`, `requireBusiness()`, landing page | **Code written, NOT verified**: needs a live Supabase project |
| Database schema / RLS (`0001_initial_schema.sql`) | **Drafted, not applied, not tested** |
| RLS isolation tests (`rls.integration.test.ts`) | **Written, skipped** until Supabase keys are in `.env.local` |
| Auth/navigation e2e | **Written, not run** (need Supabase) |
| Module pages (customers, appointments, services, finances, intelligence/*, settings) | **Scaffolded**: placeholders only |
| Dashboard | **Scaffolded**: KPI cards show "—" |
| All business modules and intelligence features | **Planned** |
| Deployment | **Not done** |

Tests last run: Vitest 12 passed / 11 skipped (live-DB tests); typecheck and lint clean. Playwright and RLS tests have not run since auth was added.

**Next task:** once `.env.local` has the Supabase URL, anon key and service-role key and migration 0001 is applied: run `npm test` (RLS tests must un-skip and pass), `npm run build`, `npm run test:e2e`; fix failures; then check off Milestone 1 in ROADMAP. Do not start Milestone 2 until Milestone 1 is verified.
