# BusinessOS

**Manage smarter. Grow faster.**

Business management and growth intelligence for small appointment-based service businesses. TCSS 490 Artifact 5 (Moonshot) project and the foundation of a real SaaS product.

> **Status:** early scaffold. The app shell and project documentation exist; business features are planned. See [CLAUDE.md](CLAUDE.md#current-status-update-every-session) for exactly what is implemented.

## Getting started

Requires Node 20.19+ (developed on Node 26) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Environment variables

Create `.env.local` in the repo root (it is git-ignored; never commit it):

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase Project Settings > Data API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Project Settings > API Keys > Publishable key (safe for the browser)
SUPABASE_SERVICE_ROLE_KEY=        # Project Settings > API Keys > Secret key. SERVER-ONLY, bypasses security
```

The service-role key is used only by the integration tests and the e2e teardown (to create and delete throwaway test users). The app itself never reads it. Without these variables the app will not start, the isolation tests skip, and the auth e2e tests cannot run.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Run / build / serve |
| `npm run lint` · `npm run typecheck` | Static checks |
| `npm test` | Vitest unit/integration tests |
| `npm run test:e2e` | Playwright end-to-end tests (run `npx playwright install chromium` once) |

## Documentation

[PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md) · [Decisions](docs/DECISIONS.md) · [Dev log](docs/DEVLOG.md)
