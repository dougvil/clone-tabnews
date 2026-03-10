# Copilot Instructions — clone-tabnews

A Next.js clone of [tabnews.com.br](https://tabnews.com.br), built incrementally while following [curso.dev](https://curso.dev).

---

## Architecture Overview

- **Framework**: Next.js App Router (no `pages/` directory).
- **API routes** live in `src/app/api/v1/` — each folder has a `route.ts` that exports named HTTP handlers (`GET`, `POST`, etc.).
- **Dynamic API routes** use Next.js bracket-folder convention: `src/app/api/v1/users/[username]/route.ts`.
- **Models** live in `src/models/` — one file per domain entity (e.g., `user.ts`, `migrator.ts`). Business logic lives here.
- **Infrastructure layer** in `src/infra/`: `database.ts` (Postgres client), `errors.ts` (typed error classes), `migrations/` (SQL files), `compose.yaml` (Docker).
- **Types / DTOs** live in `src/types/` — shared TypeScript types for API contracts and domain objects.
- **Database**: PostgreSQL 16. No connection pool — `infra/database.ts` opens one `pg.Client` per query and closes it in `finally`.
- **Base URL** for TypeScript module resolution: `src/` (set in `tsconfig.json`). Import as `import x from 'infra/database'`, not with relative `../../` paths.

---

## Key Files

| Path                        | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `src/infra/database.ts`     | Postgres client factory — one client per query     |
| `src/infra/errors.ts`       | Typed HTTP error classes                           |
| `src/infra/migrations/`     | `node-pg-migrate` SQL migrations                   |
| `src/infra/compose.yaml`    | Docker Compose — `postgres:16.0-alpine3.18`        |
| `src/models/user.ts`        | User domain logic (create, findByUsername, etc.)   |
| `src/models/migrator.ts`    | Migration runner (list / run pending)              |
| `src/types/api.ts`          | Shared API types: `ApiResponse<T>`, `PublicUser`   |
| `src/tests/orquestrator.ts` | Test lifecycle helpers (wait, clearDatabase, etc.) |
| `src/app/api/v1/`           | REST API route handlers                            |

---

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

`npm run test` and `npm run dev` start/stop Docker Compose automatically via pre/post hooks.

---

## Environment & Config

- Node version: `lts/krypton` (Node 18) — defined in `.nvmrc`.
- Environment variables are loaded from `.env.development`. Never commit secrets (the file is git-tracked only for local dev defaults).
- SSL is auto-enabled in `production` and disabled in `development`/`test` (`infra/database.ts → getSslValues()`).
- Commits must follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint + Husky.

---

## API Patterns

### Response Envelope

All success responses must wrap the payload in a `data` key using the `ApiResponse<T>` type from `src/types/api.ts`:

```ts
// src/types/api.ts
export type ApiResponse<T> = { data: T };
```

```ts
// route handler example
return NextResponse.json({ data: foundUser }); // 200
return NextResponse.json({ data: createdUser }, { status: 201 });
```

### Error Responses

All errors extend `BaseError` in `infra/errors.ts` and implement `toJSON()`. Route handlers return them directly:

```ts
return NextResponse.json(error, { status: error.statusCode });
```

Error response shape:

```json
{
  "name": "NotFoundError",
  "message": "...",
  "action": "...",
  "status_code": 404
}
```

Available error classes: `InternalServerError` (500), `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `TooManyRequestsError` (429), `ServiceError` (503), `ValidationError` (400).

> **Important**: When creating custom error subclasses, always forward `message: options.message` to `super()`, otherwise the message is lost.

### Dynamic Route Params (Next.js 15+)

In Next.js 15+, route segment params are a `Promise`. Always `await params`:

```ts
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  // ...
}
```

### Input Validation

Use `zod` schemas in the model layer. On `ZodError`, throw a `ValidationError`. Do not expose raw Zod errors to the API.

### Sensitive Data

Never return sensitive fields (e.g., `password`) from API responses. Use `SELECT` queries that explicitly list only the safe columns, and represent public shapes with the `PublicUser` type (or similar types in `src/types/api.ts`).

### Migrations via API

- `GET /api/v1/migrations` — dry-run, returns pending migrations (never applies).
- `POST /api/v1/migrations` — applies pending migrations; returns `201` + list if any ran, `200` + `[]` if already up-to-date.
- Migration files live in `infra/migrations/`, follow `node-pg-migrate` conventions, tracked in `pgmigrations`.

---

## Security Patterns

### Password Hashing

Passwords are **never stored in plain text**. The model layer hashes every password with **Argon2id** before persisting it to the database.

- Package: [`argon2`](https://github.com/ranisalt/node-argon2) — Node.js bindings for the reference Argon2 implementation.
- Algorithm: `argon2id` (hybrid — resistente a side-channel e GPU attacks).
- The stored hash has the PHC format: `$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>`.

Implementation in `src/models/user.ts`:

```ts
import argon2 from 'argon2';

// inside runInsertQuery():
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
// store passwordHash in the DB, never the plain-text password
```

Rules:

- Always hash in the **model layer**, never in the route handler.
- The `RETURNING` clause of the INSERT must list **only safe columns** (`id, username, email, created_at, updated_at`) — never `password`.
- Use `argon2.verify(storedHash, candidatePassword)` to authenticate a user; never compare hashes directly.

---

## Testing Patterns

- All tests are **integration tests** that fire real HTTP requests against `http://localhost:3000`.
- Test files live in `src/tests/integration/api/v1/<resource>/` and mirror the route structure.
- Every test file calls `orquestrator.waitForAllServices()` in `beforeAll` — retries fetching `/api/v1/status` until Next.js is ready.
- Tests that modify state (write to DB) call `orquestrator.clearDatabase()` + `orquestrator.runPendingMigrations()` in `beforeAll` to get a clean slate.
- Jest module resolution base is `src/` (`moduleDirectories: ['node_modules', '<rootDir>/src']`), so imports use bare paths: `import orquestrator from 'tests/orquestrator'`.
- Test timeout: 30 s globally.

```ts
// Standard beforeAll for tests that modify the database
beforeAll(async () => {
  await orquestrator.waitForAllServices();
  await orquestrator.clearDatabase();
  await orquestrator.runPendingMigrations();
});
```

---

## Frontend Patterns

- Page files are named `page.tsx` under their route folder (e.g., `src/app/page.tsx`, `src/app/status/page.tsx`).
- A single root layout at `src/app/layout.tsx` wraps every page with `<html>` and `<body>`.
- Pages are **Server Components by default**. Add `'use client'` only when using browser APIs or React hooks (`useSWR`, `useState`, `useEffect`).
