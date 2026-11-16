# BusinessOS: Roadmap

Key dates: **Dec 7, 2026**: working MVP demo · **Dec 13, 2026**: final submission · after Dec 13: continued product development.
Today at time of writing: Nov 15, 2026 (22 days to demo). Check items off only when **implemented and verified**. `[~]` = code written but not yet verified.

**Priority rule:** if time is short, ship one complete, tested, deployed workflow (auth → customers/services → appointment → sale → dashboard) before any intelligence feature. Never cut auth, data isolation, or financial correctness.

## Milestone 0: Scaffold and planning (Nov 15) ✅
- [x] Inspect environment; evaluate stack and risks (DECISIONS ADR-008/009)
- [x] PRD, ARCHITECTURE, ROADMAP, DEVLOG, DECISIONS, CLAUDE.md
- [x] Draft database schema + RLS (`supabase/migrations/0001_initial_schema.sql`, not yet applied)
- [x] Next.js + TypeScript + Tailwind + shadcn/ui + Recharts + Lucide scaffold
- [x] App shell: sidebar, mobile nav, theme toggle, loading/error states, placeholder routes
- [x] Vitest + Playwright configured; money helpers tested; nav smoke e2e
- [x] Git repository initialized and committed

## Milestone 1: Foundation: auth, database, onboarding (target Nov 16-21)
- [x] Owner decisions: hosted Supabase, email confirmation off, free tiers OK (DECISIONS: Resolved decisions)
- [x] Read Next docs on authentication + cache components
- [ ] Create Supabase project; apply migration 0001; generate DB types
- [x] Install `@supabase/ssr`, `@supabase/supabase-js`, `zod`; env handling + `.env.example`
- [~] Register / login / logout pages and server actions (Zod-validated) *(code written; unverified until Supabase is connected)*
- [~] `proxy.ts` optimistic redirect; `requireBusiness()` authorization choke point *(code written; unverified until Supabase is connected)*
- [~] Onboarding: create business via `create_business()` RPC *(code written; unverified until Supabase is connected)*
- [~] Landing page for signed-out users *(code written; unverified until Supabase is connected)*
- [~] **Tests** *(written; form validation passing, the rest awaiting live Supabase)*: RLS isolation (two tenants, every table), composite FK rejection, form validation, e2e sign-up → onboarding → dashboard
- [ ] Update CLAUDE.md status + DEVLOG

## Milestone 2: Operations (target Nov 22-30; Thanksgiving Nov 26)
- [ ] Domain: appointment status transitions (+ tests)
- [ ] Services CRUD (price in cents, duration, active toggle)
- [ ] Customers CRUD, search/filter, profile with history
- [ ] Appointments: create, status updates, upcoming/past list
- [ ] Transactions: record sale (optional appointment link), record expense (category), history + date filter
- [ ] Duplicate-sale prevention tested at DB and UI level
- [ ] Domain: finance metrics (+ tests against hand-computed fixtures)
- [ ] Dashboard: KPIs, date filter, revenue trend (Recharts), top services, recent activity, empty state
- [ ] e2e: add service + customer → schedule → complete → record sale → dashboard totals match

## Milestone 3: Intelligence (target Dec 1-5)
- [ ] Domain: inactive-customer detection (+ boundary tests) and Opportunities page with explanations
- [ ] Settings: configurable fallback threshold / minimum visits
- [ ] Domain: pricing simulator + scenarios (+ tests) and Simulator page with labeled assumptions
- [ ] Experiments: CRUD, status, expected vs actual comparison, causation disclaimer
- [ ] Business Memory: decision log, optional experiment link
- [ ] e2e: simulate a price change; create experiment; log decision

## Milestone 4: Release (Dec 5-7 for demo; Dec 8-13 for submission)
- [ ] Seed script for demonstration data (clearly marked demo business)
- [ ] Security review (RLS audit, env/secret scan, error handling, input validation pass)
- [ ] Deploy to Vercel + Supabase (**requires owner approval**); smoke test on production
- [ ] Demo script and rehearsal (Dec 6-7)
- [ ] Bug fixes from demo feedback
- [ ] Final docs pass: README, CLAUDE.md, PRD status, ARCHITECTURE accuracy, DEVLOG, test report
- [ ] Final submission (Dec 13)

## Cut list (drop in this order if behind)
1. CSV import (not planned unless everything else is done)
2. Dark-mode polish
3. Revenue trend granularity options
4. Experiment/Memory linking UI
5. Mobile e2e coverage (keep desktop)

## Stretch / post-course
- [ ] AI-generated explanations of simulator/opportunity results (explain only; never calculate)
- [ ] Full calendar view; staff roles; multi-business switcher
- [ ] CSV import; integrations (Square, Booksy, QuickBooks)
- [ ] Additional simulators (hiring, marketing budget, operating hours)
- [ ] Controlled experiments and statistical analysis
- [ ] Optional customer outreach drafts (owner-reviewed; never automatic)
