# Dusk Trip Admin

Next.js admin panel for Dusk Trip.

## Prerequisites

- Node.js >= 20
- API running at `http://localhost:3000` (when calling the backend)

## Local development

From the repository root:

```bash
pnpm dev:admin
```

The app runs at http://localhost:3002

## Environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable              | Description                                     |
| --------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL (default: `http://localhost:3000`) |
