# mood-trip

A full-stack monorepo for the mood-trip product (in active development).

This repository uses **pnpm workspaces**. Run all commands from the **repository root** unless noted otherwise.

---

## Where to work (by role)

### Frontend

Primary directories:

| Path          | Purpose                                 |
| ------------- | --------------------------------------- |
| `apps/web`    | User-facing Next.js app                 |
| `apps/admin`  | Admin panel (Next.js, planned)          |
| `apps/mobile` | Expo app (planned)                      |
| `packages/ui` | Shared UI / design system (Radix-based) |

You will mostly work here. The web app talks to the API over HTTP (not directly to the database).

Typical commands (once each app is set up):

```bash
pnpm dev          # API + web together (preferred)
pnpm dev:web      # web only
pnpm dev:admin    # when the admin app is ready
```

Environment variables for the web app will live under `apps/web` (e.g. `.env.local`) — e.g. `NEXT_PUBLIC_API_URL` pointing at the API.

---

### Backend

Primary directories:

| Path                  | Purpose                              |
| --------------------- | ------------------------------------ |
| `apps/api`            | NestJS REST API                      |
| `packages/database`   | Prisma schema, migrations, DB client |
| `packages/validators` | Shared validation schemas (Zod)      |

You own server logic, database schema, and migrations.

Typical commands:

```bash
pnpm dev:db       # start local Postgres (Docker)
pnpm db:migrate
pnpm dev          # API + web (or pnpm dev:api for API only)
```

Database connection string: copy `.env.example` to `.env` at the repo root (see [Environment variables](#environment-variables)).

---

### Shared / everyone

| Path                 | Purpose                          |
| -------------------- | -------------------------------- |
| `packages/config`    | Shared TypeScript config         |
| Root `package.json`  | Workspace scripts                |
| `docker-compose.yml` | Local PostgreSQL for development |

All contributors should run `pnpm install` once at the root after cloning.

---

## Architecture (high level)

```
apps/web, apps/admin  →  apps/api  →  PostgreSQL (Docker)
                              ↑
                    packages/database (Prisma)
```

- **Frontend** must not import Prisma or access the DB directly.
- **Backend** exposes HTTP endpoints; data access goes through `packages/database`.

---

## Requirements

- Node.js 20+
- pnpm 9+
- Docker Desktop (for local PostgreSQL)

---

## Getting started (first time on this repo)

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if your local Postgres port or credentials differ.

3. Start the database (Docker; keep this separate from `pnpm dev`):

   ```bash
   pnpm dev:db
   ```

4. Apply migrations:

   ```bash
   pnpm db:migrate
   ```

5. Start the API and web app together:

   ```bash
   pnpm dev
   ```

   This builds `@mood-trip/database` and `@mood-trip/validators`, then starts the API and web in parallel. To run only one side, use `pnpm dev:api` or `pnpm dev:web`.

6. Verify the API:

   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/users
   ```

> **Note:** If port `3000` is already in use on your machine, run the API or web app on another port and adjust URLs accordingly. Plan My Trip also needs `GEMINI_API_KEY` and `MAPTILER_API_KEY` in the root `.env` (see `.env.example`).

---

## Environment variables

| Variable           | Where       | Description                                              |
| ------------------ | ----------- | -------------------------------------------------------- |
| `DATABASE_URL`     | Root `.env` | PostgreSQL connection string (used by Prisma)            |
| `GEMINI_API_KEY`   | Root `.env` | Required for `POST /trips/plan` (AI trip planner)        |
| `MAPTILER_API_KEY` | Root `.env` | Required for geocoding and itinerary map styles          |

Do **not** commit `.env`. Only `.env.example` belongs in Git.

---

## Useful scripts (root)

| Command            | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `pnpm dev`         | Build shared packages, then start API + web together                        |
| `pnpm dev:api`     | Build `@mood-trip/database` + validators, then start the API only           |
| `pnpm dev:web`     | Start the web app only                                                      |
| `pnpm dev:db`      | Start local PostgreSQL via Docker Compose                                   |
| `pnpm db:migrate`  | Run Prisma migrations (development)                                         |
| `pnpm db:generate` | Regenerate Prisma Client                                                    |
| `pnpm db:studio`   | Open Prisma Studio (optional; UI may be flaky locally)                      |

---

## Troubleshooting

- **Cannot connect to the database:** Another PostgreSQL instance may be using port `5432` on your Mac. Align `docker-compose.yml` host port and `DATABASE_URL` (e.g. use `5433` on the host).
- **API fails after changing Prisma schema:** Run `pnpm db:generate` and `pnpm --filter @mood-trip/database build`, then restart `pnpm dev:api`.

---

## Repository visibility

This project is under active development. Access to the repository is limited to collaborators. Do not commit secrets or production credentials.
