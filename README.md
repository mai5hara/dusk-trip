# Dusk Trip

A travel journal for keeping trips as photo albums, organized by day and time of day, plus an AI trip planner that drafts itineraries from a mood and a destination.

**Live demo:** https://dusk-trip.vercel.app/

> The API runs on a free tier that sleeps after 15 minutes idle. The first request after a pause can take 30–60 seconds while it wakes up. The web app pings the API on page load to start that early.

---

## What you can do in the demo

| Area             | Features                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Account**      | Sign up / log in with email and password, or continue with Google                                                                          |
| **Albums**       | Create an album (cover photo, title, location, travel period), then add memories day by day with photo, caption, location, and time of day |
| **Browse**       | Trip list with search, sort, and filters; trip detail grouped by day; edit album and memories                                              |
| **Trip Planner** | Pick a mood and destination, generate a multi-day itinerary with Gemini, explore stops on a MapTiler map, and save itineraries             |

The web app is responsive down to ~375px wide.

### Demo scope

| Part                     | Status                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/web`               | **Public demo** (link above)                                                                                           |
| `apps/api`               | Deployed as the demo backend                                                                                           |
| `apps/admin`             | In the repo, **local only**. User management is still in review (#62). No public Admin URL.                            |
| `apps/mobile`            | Stub only. Development will move to a separate repository.                                                             |
| My Page, Contact         | Hidden in v1                                                                                                           |
| Password reset           | The flow exists, but no email is sent. The reset link is only written to the API log, so it is not usable in the demo. |
| Slideshow, collaboration | Future work, outside this repo's v1                                                                                    |

### Credits

- **Trip Planner** (`apps/web/app/(main)/itineraries`, `apps/api/src/itineraries`, `apps/api/src/ai`): built by teammate **Francois Polo**.
- Everything else, plus deployment: **Mai Gohara** ([@mai5hara](https://github.com/mai5hara)).

---

## Tech stack

| Layer    | Tech                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Web      | Next.js 16 (App Router), React 19, Tailwind CSS 4, TanStack Query, [tokonoma-ui](https://www.npmjs.com/package/tokonoma-ui) |
| API      | NestJS 11, Passport JWT, Google Sign-In                                                                                     |
| Data     | PostgreSQL 16, Prisma 7                                                                                                     |
| Shared   | Zod schemas in `packages/validators`, used by both web and API                                                              |
| Services | Gemini (itinerary generation), MapTiler (maps, geocoding), AWS S3 + CloudFront (photos)                                     |
| Tooling  | pnpm workspaces, Vitest, Jest, ESLint, Prettier, GitHub Actions                                                             |

## Architecture

```
                 ┌──────────────────────────────┐
 Browser ──────► │ apps/web  (Next.js, Vercel)  │
                 │  └ /api/uploads ─────────────┼──► S3 ──► CloudFront (photo URLs)
                 └──────────────┬───────────────┘
                                │ REST + JWT
                 ┌──────────────▼───────────────┐
                 │ apps/api  (NestJS, Render)   │ ──► Gemini, MapTiler
                 └──────────────┬───────────────┘
                                │ Prisma (packages/database)
                 ┌──────────────▼───────────────┐
                 │ PostgreSQL  (Neon)           │
                 └──────────────────────────────┘
```

- The web app never touches the database. All data goes through the API.
- Photo uploads go through a Next.js route handler that checks the user's token against the API and then writes to S3.
- `apps/admin` talks to the same API (local only for now).

## Repository layout

| Path                  | Purpose                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/web`            | User-facing Next.js app (see [apps/web/README.md](apps/web/README.md) for conventions and S3 setup) |
| `apps/api`            | NestJS REST API                                                                                     |
| `apps/admin`          | Admin panel (Next.js, local only)                                                                   |
| `apps/mobile`         | Expo stub                                                                                           |
| `packages/database`   | Prisma schema, migrations, seed, DB client                                                          |
| `packages/validators` | Shared Zod schemas                                                                                  |
| `packages/ui`         | Re-exports the design system used by the apps                                                       |
| `packages/config`     | Shared TypeScript / ESLint / Prettier config                                                        |

---

## Local development

### Requirements

- Node.js 20+ (Prisma 7 needs 20.19+)
- pnpm 9 (`corepack enable` picks up the version in `package.json`)
- Docker (for local PostgreSQL)

### Setup

```bash
pnpm install

# API env (repo root)
cp .env.example .env
# Prisma CLI and seed env
cp packages/database/.env.example packages/database/.env
# Web env
cp apps/web/.env.local.example apps/web/.env.local

pnpm dev:db        # PostgreSQL 16 in Docker on host port 5433
pnpm db:migrate    # apply Prisma migrations
pnpm dev           # build shared packages, then run API (:3000) + web (:3001)
```

Check the API: `curl http://localhost:3000/health` should return `{"status":"ok"}`.

Run only one side with `pnpm dev:api` or `pnpm dev:web`. Run the admin app with `pnpm dev:admin` (port 3002).

### Seed data (local only)

`pnpm db:seed` creates a demo account with sample trips. Log in to the web app (and the local admin app) with:

- Email: `demo@example.com`
- Password: `password123`

The seed only creates data that is missing, so running it again changes nothing. To start over, run `pnpm db:reset` (**drops all data in the local database** and reapplies migrations), then `pnpm db:seed`.

The seed is for local development only and refuses to run when `DATABASE_URL` does not point at `localhost`. The demo account exists only in local databases; the deployed demo is not seeded, so create an account through the web app there.

### Environment variables

**`packages/database/.env`** (Prisma CLI and seed):

| Variable       | Required | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string for migrations and the seed |

**Root `.env`** (API):

| Variable                                          | Required | Description                                                                                                                                 |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                    | Yes      | PostgreSQL connection string                                                                                                                |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`         | Yes      | Separate random strings for signing tokens                                                                                                  |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Yes      | Token lifetimes, e.g. `15m`, `7d`                                                                                                           |
| `GOOGLE_CLIENT_ID`                                | Yes      | Google OAuth client ID (Google Sign-In)                                                                                                     |
| `GEMINI_API_KEY`                                  | Yes      | Gemini API key for the Trip Planner                                                                                                         |
| `MAPTILER_API_KEY`                                | Yes      | MapTiler key for geocoding and map styles                                                                                                   |
| `MAPTILER_MAP_API_KEY`                            | No       | Separate MapTiler key for map styles, if you use one                                                                                        |
| `WEB_ORIGIN`                                      | Yes      | Allowed web origin(s) for CORS, comma-separated. List the production URL first: the first entry is also used to build password reset links. |
| `ADMIN_ORIGIN`                                    | No       | Allowed admin origin(s) for CORS                                                                                                            |
| `PASSWORD_RESET_EXPIRES_IN`                       | No       | Reset token lifetime (default `1h`)                                                                                                         |
| `API_PORT`                                        | No       | Local API port (default `3000`). Hosts that set `PORT` take precedence.                                                                     |

**`apps/web/.env.local`**:

| Variable                                                                     | Required           | Description                                                                                 |
| ---------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                                                        | Yes                | API base URL, no trailing slash                                                             |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`                                               | For Google Sign-In | Same client ID as the API                                                                   |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` | In production      | Photo uploads. Without them, local dev saves to `public/uploads`; production returns `503`. |
| `S3_PUBLIC_URL_BASE`                                                         | Recommended        | CloudFront URL used for returned photo URLs                                                 |

Never commit `.env` or `.env.local`. Only the `.example` files belong in Git.

### Useful scripts

| Command                                                 | Description                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm dev`                                              | Build shared packages, then start API + web                          |
| `pnpm dev:api` / `pnpm dev:web` / `pnpm dev:admin`      | Start one app                                                        |
| `pnpm dev:db`                                           | Start local PostgreSQL (Docker Compose)                              |
| `pnpm db:migrate` / `pnpm db:generate` / `pnpm db:seed` | Prisma migrate / generate client / seed (local)                      |
| `pnpm db:reset`                                         | Drop all local data and reapply migrations (then run `pnpm db:seed`) |
| `pnpm lint` / `pnpm format:check` / `pnpm test`         | Lint / Prettier check / tests across the workspace                   |

### Troubleshooting

- **Cannot connect to the database:** another PostgreSQL may be using the port. Align the host port in `docker-compose.yml` with `DATABASE_URL` (the default is `5433`).
- **API fails after a Prisma schema change:** run `pnpm db:generate` and `pnpm --filter @mood-trip/database build`, then restart `pnpm dev:api`.

---

## Deployment

The demo runs on free tiers: **Vercel** (web), **Render** (API), **Neon** (PostgreSQL), and **S3 + CloudFront** (photos). Keep the API and database in the same region (Oregon / `us-west-2` here) to keep request latency low.

### Database (Neon)

1. Create a PostgreSQL 16 project.
2. Copy the **direct** (non-pooled) connection string with `?sslmode=require`. `prisma migrate deploy` does not work reliably through the pooler.

### API (Render Web Service)

| Setting           | Value                                                                                                                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root Directory    | _(empty: repo root)_                                                                                                                                                                                                                                                                               |
| Build Command     | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @mood-trip/database db:generate && pnpm --filter @mood-trip/database build && pnpm --filter @mood-trip/validators build && pnpm --filter @mood-trip/api build && pnpm --filter @mood-trip/database exec prisma migrate deploy` |
| Start Command     | `pnpm --filter @mood-trip/api start`                                                                                                                                                                                                                                                               |
| Health Check Path | `/health`                                                                                                                                                                                                                                                                                          |

- Set the root `.env` variables from the table above, plus `NODE_VERSION=22`. Do not set `PORT`; Render provides it.
- Migrations run at the end of every build, so each deploy applies new migrations.
- Set `WEB_ORIGIN` to the Vercel production URL once it exists. To call the API from Vercel preview URLs, append them after the production URL (comma-separated). The first entry is used for password reset links, so the production URL must stay first.
- On the free instance, the service sleeps after 15 minutes idle. `ApiWarmup` in the web app calls `/health` on page load to wake it.

### Web (Vercel)

| Setting        | Value                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| Root Directory | `apps/web`                                                                                    |
| Build Command  | `cd ../.. && pnpm --filter @mood-trip/validators build && pnpm --filter @mood-trip/web build` |

- Set the `apps/web/.env.local` variables from the table above, pointing `NEXT_PUBLIC_API_URL` at the Render URL.
- Environment variable changes need a redeploy to take effect.

### Photos (S3 + CloudFront)

See [apps/web/README.md](apps/web/README.md#image-uploads) for the bucket, IAM, and CloudFront setup.

---

## License

[MIT](LICENSE)
