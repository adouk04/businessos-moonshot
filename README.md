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

Supabase/auth configuration arrives in Phase 1; copy `.env.example` to `.env.local` then.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Run / build / serve |
| `npm run lint` · `npm run typecheck` | Static checks |
| `npm test` | Vitest unit/integration tests |
| `npm run test:e2e` | Playwright end-to-end tests (run `npx playwright install chromium` once) |

## Documentation

[PRD](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md) · [Decisions](docs/DECISIONS.md) · [Dev log](docs/DEVLOG.md)
