# `@mood-trip/web`

Next.js app for the mood-trip product.

## Directory conventions

Prefer **colocation**: keep page-specific UI and hooks next to the route. Do **not** add a top-level `features/` folder for new work.

```
app/
  (main)/
    page.tsx                 # thin route entry
    _components/             # shared within (main) (e.g. trip list)
    _hooks/
    _lib/
    plan-my-trip/
      page.tsx
      _components/           # this page only
      _hooks/
      _lib/
  (auth)/…
api/                         # all HTTP-related code
  _common/
    http.ts                  # shared URL / headers / JSON helpers
    client.ts                # apiClient (authenticated)
    public-client.ts         # publicApi (unauthenticated)
  auth/api.ts
  trips/api.ts
  …
lib/                         # app-wide non-HTTP infra (auth tokens, query)
components/                  # truly shared chrome (Header, Footer, theme)
```

| Location              | Put here                                                          |
| --------------------- | ----------------------------------------------------------------- |
| `app/.../_components` | UI used by that route (or route group)                            |
| `app/.../_hooks`      | Hooks for that route (or route group)                             |
| `app/.../_lib`        | Small helpers for that route                                      |
| `api/_common/`        | Shared fetch helpers (`client.ts`, `public-client.ts`, `http.ts`) |
| `api/<domain>/`       | Endpoint functions for that backend domain                        |
| `lib/`                | Tokens, QueryProvider, AuthProvider, shared utils                 |
| `components/`         | Layout chrome reused across many routes                           |

### Naming

- Route / folder segments: **kebab-case** (`plan-my-trip`)
- React components: **PascalCase** (`TripCard.tsx`)
- Hooks: **camelCase** `use*.ts` (`useTripsQuery.ts`)
- Other modules: **kebab-case** (`trip-list-utils.ts`)
- Private folders (`_components`, `_hooks`, `_lib`) are not routes ([Next.js colocation](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders))

### What stays shared

- **Auth state** lives in `lib/auth/` (used by root layout and many pages).
- **HTTP auth endpoints** live in `api/auth/`.
- **Trip list filter context** lives under `app/(main)/_hooks/` because it wraps the main shell (Header + home).

When the same UI is needed from **three or more unrelated routes**, extract a shared module then — not by default.
