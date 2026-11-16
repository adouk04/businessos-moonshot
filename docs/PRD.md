# BusinessOS: Product Requirements Document

> Status legend used across the docs: **Implemented** (works and is tested), **Scaffolded** (UI shell only, no behavior), **Planned** (designed, not built).
> Last updated: 2026-11-15

## 1. Vision

**BusinessOS: Manage smarter. Grow faster.**

Most small-business software records what happened. BusinessOS helps owners understand what happened, find missed revenue, decide what to do next, and measure whether the decision worked.

Core loop: **Manage → Analyze → Discover → Simulate → Experiment → Measure → Learn**

Two capabilities share one data model:

- **Lightweight business management**: customers, services, appointments, sales, expenses, metrics.
- **Business growth intelligence**: missed-revenue detection, decision simulation, growth experiments, and a decision log.

The management features work standalone; the intelligence features are computed from the same records. AI explanations are a stretch goal; **every number is deterministic and works without AI.**

## 2. Target users

**Primary:** owner-operators of appointment-based service businesses (barbershops, hair salons, auto detailing, residential cleaning). Typically 1-5 people, no dedicated admin, non-technical, time-poor, often on a phone.

**Design implications:** plain language over jargon; manual entry first; no required third-party software; minimal personal data about customers; mobile-friendly.

**Not in MVP:** multi-location chains, retail inventory, payroll, formal accounting.

## 3. MVP boundaries

### In scope
Auth + business workspace · customers · services · appointments (list view) · sales and expenses · dashboard · inactive-customer detection · pricing simulator · experiments (manual outcomes) · business memory (decision log) · seeded demo data · deployment.

### Out of scope (future)
Third-party integrations (Square, Booksy, QuickBooks) · automated customer outreach (the product never contacts customers on its own) · full calendar UI · multi-user staff roles beyond a basic owner/staff column · hiring/marketing/hours simulators · statistical/controlled experiment analysis · AI recommendations (stretch) · payments processing · invoicing · CSV import (included only if time allows after core flows).

### Non-negotiables (never traded for scope)
1. Authentication and business-level data isolation.
2. Financial correctness (integer cents; no duplicate sales).
3. Honest labeling: estimates are estimates, simulations are hypothetical, correlation is not causation.

## 4. Modules, user stories, acceptance criteria

IDs are referenced from the roadmap and tests.

### M1: Authentication and business workspaces
- **US-1.1** As a new owner, I can register and log in with email and password.
- **US-1.2** As an owner, I can create a business workspace (name, industry).
- **US-1.3** As an owner, I can log out securely.
- **US-1.4** As an owner, I only ever see my own business's data.

**Acceptance**
- Unauthenticated requests to any app route redirect to login.
- A user with no business is routed to onboarding; after onboarding, to the dashboard.
- Business ID is never trusted from the client: it is derived server-side from the session and membership.
- RLS test: user A cannot read, insert, update, or delete rows of user B's business (every table).
- Data model supports multiple businesses per user (membership table) even though the MVP UI exposes one.

### M2: Customers
- **US-2.1** Create / edit customers (name required; email, phone, notes optional).
- **US-2.2** Search and filter customers.
- **US-2.3** View a profile with appointment and transaction history.
- **US-2.4** See which customers haven't returned recently.

**Acceptance:** email/phone never required; search by name/phone/email is case-insensitive; profile shows history ordered by date; invalid input produces field-level errors.

### M3: Services and pricing
- **US-3.1** Create/edit services with price and estimated duration.
- **US-3.2** Activate/deactivate services (inactive services can't be booked, but history is preserved).

**Acceptance:** price stored as integer cents; no industry-specific services hardcoded; deactivating never deletes history.

### M4: Appointments
- **US-4.1** Create an appointment (customer, service, date/time).
- **US-4.2** Update status: Scheduled → Completed / Cancelled / No-show.
- **US-4.3** View upcoming and past appointments in a list.

**Acceptance**
- Valid transitions are defined in one pure function and unit-tested (e.g. Completed → Scheduled is rejected; the exact table is defined in ARCHITECTURE §6).
- Price is snapshotted onto the appointment at booking time.
- Marking Completed **does not** create a sale.
- Customer and service must belong to the same business (enforced by composite FKs and server validation).

### M5: Sales and expenses
- **US-5.1** Record a sale (optionally linked to an appointment and customer).
- **US-5.2** Record an expense with a category.
- **US-5.3** View and date-filter transaction history.

**Acceptance**
- Money is integer cents end to end.
- At most one sale per appointment, enforced by a partial unique index; the UI explains the conflict instead of crashing.
- Recording a sale for a non-completed appointment is allowed only with explicit owner confirmation (the spec requires payment to be explicit, not implied).

### M6: Dashboard
- **US-6.1** See total revenue, recorded expenses, estimated operating surplus, appointment counts, completed appointments, average transaction value, top services, revenue trend, recent activity.
- **US-6.2** Filter by date range.

**Acceptance**
- All figures come from database records; no sample numbers outside seed data.
- "Estimated operating surplus" = sales − recorded expenses for the period and is labeled as **not** accounting net profit (no depreciation, taxes, owner pay, etc.).
- Calculation functions are pure and unit-tested against hand-computed fixtures. Empty state shown when there is no data.

### M7: Revenue Recovery Engine (Opportunities)
- **US-7.1** See repeat customers who are overdue relative to their own return pattern.
- **US-7.2** Understand *why* each customer was flagged.
- **US-7.3** See an estimated, clearly-labeled potential booking value.

**Rules (MVP, transparent and deterministic)**
1. Only **completed** appointments count as visits.
2. A customer with ≥ `min_visits_for_interval` completed visits (default 3) gets an individual return interval = **median** gap in days between consecutive completed visits.
3. A customer with 2 to (min−1) completed visits uses the business's **fallback threshold** (default 45 days, configurable).
4. Customers with 0-1 completed visits are not flagged (not yet "repeat" customers).
5. Flag when `days_since_last_visit > interval × 1.5` (multiplier is a named constant, default 1.5) or `> fallback` for rule 3.
6. Exclude customers who already have a future scheduled appointment.
7. One opportunity per customer. Opportunities are not summed with anything else, so no double counting.
8. Potential booking value = price snapshot of the customer's most recent completed appointment. Label: "Estimate, not guaranteed income."

**Acceptance:** each flagged customer shows an explanation string (e.g. "Typically returns every 30 days; last visit 55 days ago"); unit tests cover each rule and boundary; no automatic contact.

### M8: Decision Simulator (pricing)
- **US-8.1** Enter current price, proposed price change, baseline volume, expected demand change, optional variable cost.
- **US-8.2** See current vs projected revenue, difference, contribution difference (when cost provided), break-even volume.
- **US-8.3** Compare pessimistic / baseline / optimistic scenarios with adjustable assumptions.

**Acceptance**
- Formulas are deterministic pure functions in integer cents, unit-tested against hand-calculated cases, including edge cases (zero volume, price drop, cost ≥ price).
- Break-even: the volume at which projected contribution equals current contribution. Undefined (shown explicitly) when new unit margin ≤ 0.
- All outputs labeled "Hypothetical"; assumptions displayed next to results. AI (if ever added) may explain but never calculates.

### M9: Growth experiments
- **US-9.1** Create an experiment: name, hypothesis, dates, target metric, baseline, proposed action, expected outcome, status, notes.
- **US-9.2** Enter the actual outcome manually and compare it with expected.

**Acceptance:** statuses Draft/Active/Completed/Cancelled; end date ≥ start date; UI copy states that observed change after an action does not prove the action caused it.

### M10: Business memory
- **US-10.1** Log a decision with reason, date, expected result, observed result, and optional linked experiment.

**Acceptance:** structured log, newest first; linked experiment must belong to the same business.

## 5. Cross-cutting requirements

| Area | Requirement |
|---|---|
| UX | Sidebar nav, KPI cards, helpful empty states, loading and error states, confirmation before destructive actions, responsive, accessible, light/dark |
| Security | Server-side authorization, Zod validation on all inputs, no secrets in repo, safe error messages, no AI-generated SQL |
| Privacy | Collect only what's needed; customer contact info optional |
| Testing | Unit tests for business rules; integration tests for authorization; Playwright for key flows. Test results are never claimed without running them |
| Docs | CLAUDE.md, PRD, ARCHITECTURE, ROADMAP, DEVLOG, DECISIONS kept accurate |

## 6. Definition of done (MVP)

A new owner can: create an account → create a workspace → add services and customers → schedule appointments → record sales and expenses → view accurate metrics → see inactive customers → simulate a price change → create and track an experiment → log a decision and its outcome, on a working deployment, with meaningful automated tests and documentation.

## 7. Success measures (course + post-course)

- Demo (Dec 7): one end-to-end flow works live on a deployed instance.
- Submission (Dec 13): tests, docs, and security review complete.
- Post-course: foundation supports integrations, additional industries, and AI insights without a rewrite.
