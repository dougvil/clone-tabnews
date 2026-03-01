# Copilot Instructions — clone-tabnews

A Next.js clone of [tabnews.com.br](https://tabnews.com.br), built incrementally while following [curso.dev](https://curso.dev).

## Architecture

- **API routes** live in `app/api/v1/` (Next.js App Router, `route.ts` exports). These are the backend endpoints.
- **Infrastructure layer** lives in `infra/`: `database.ts` (Postgres client), `errors.ts` (typed error classes), `migrations/` (SQL migration files), `compose.yaml` (Docker Postgres).
- Database is PostgreSQL 16. There is **no connection pool** — `infra/database.ts` opens a new `pg.Client` per query and closes it in `finally`.

## Developer Workflows

```bash
npm run dev          # Start Docker DB + wait for Postgres + apply migrations + Next.js dev server
npm run test         # Start Docker DB + wait for Postgres + run Next.js dev + Jest concurrently
npm run test:watch   # Jest watch mode (expects services already running)
npm run migrations:create -- <name>   # Scaffold a new migration file in infra/migrations/
npm run migrations:up                 # Apply pending migrations (uses .env.development)
npm run migrations:down               # Rollback last migration
npm run services:up / services:stop / services:down   # Docker Compose controls
```

`npm run test` and `npm run dev` start/stop Docker automatically via pre/post hooks.

## Testing Patterns

- Tests are **integration tests** that fire real HTTP requests against `http://localhost:3000`.
- Every test file calls `orquestrator.waitForAllServices()` in `beforeAll` — it retries fetching `/api/v1/status` until Next.js is ready.
- Tests that modify state call `orquestrator.clearDatabase()` (`DROP SCHEMA public CASCADE; CREATE SCHEMA public`) to reset between suites.
- Jest module resolution includes the repo root (`moduleDirectories: ['node_modules', '<rootDir>']`), so imports like `import database from 'infra/database'` and `import orquestrator from 'tests/orquestrator'` work without `../../` paths.
- Test timeout is 30 s globally (`jest.config.js`).

## Error Handling Convention

All errors in `infra/errors.ts` extend `Error` and carry `name`, `message`, `action`, `statusCode`, plus a `toJSON()` method. API routes return them directly with `NextResponse.json(errorInstance, { status: errorInstance.statusCode })`.

```ts
// Standard error response shape
{ name: "NotFoundError", message: "Resource not found.", action: "...", statusCode: 404 }
```

Available classes: `InternalServerError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `TooManyRequestsError`.

## Migrations via API

`GET /api/v1/migrations` — dry-run, returns pending migrations as an array (never applies them).  
`POST /api/v1/migrations` — applies pending migrations; returns `201` with the list if any ran, `200` with `[]` if already up-to-date.

Migration files live in `infra/migrations/` and follow `node-pg-migrate` conventions. The tracked table is `pgmigrations`.

## Environment & Config

- Node version: `lts/krypton` (Node 18) — defined in `.nvmrc`.
- Environment variables are loaded from `.env.development`. Never commit secrets; the file is git-tracked only because it holds local dev defaults.
- SSL is auto-enabled in `production` and disabled in `development`/`test` (`infra/database.ts → getSslValues()`).
- Commits must follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint + Husky.

## Frontend Patterns

- **All pages use the Next.js App Router** (`src/app/`). There are no `pages/` directories.
- Page files are named `page.tsx` under their respective route folder (e.g., `src/app/page.tsx` for `/`, `src/app/status/page.tsx` for `/status`).
- A single root layout lives at `src/app/layout.tsx` and wraps every page with `<html>` and `<body>`.
- Pages are **Server Components by default**. Add `'use client'` only when the component uses browser APIs or React hooks (e.g., `useSWR`, `useState`, `useEffect`).

## Key Files

| Path                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `infra/database.ts`     | Postgres client factory — one client per query |
| `infra/errors.ts`       | Typed HTTP error classes                       |
| `infra/migrations/`     | `node-pg-migrate` SQL migrations               |
| `tests/orquestrator.ts` | Test lifecycle helpers (wait, clearDatabase)   |
| `app/api/v1/`           | REST API route handlers                        |
| `infra/compose.yaml`    | Docker Compose — `postgres:16.0-alpine3.18`    |
