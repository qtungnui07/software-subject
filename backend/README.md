# Duolingo Backend

Small Node backend for PostgreSQL-backed app endpoints.

## Local

From the repo root:

```bash
npm run backend
```

The backend reads env from `backend/.env` first, then falls back to `frontend/.env.local`.

## Endpoints

- `GET /health`
- `GET /health/db`
- `GET /users/count`
- `GET /profile`
- `PATCH /profile`
- `GET /settings/account`
- `PATCH /settings/account`
- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `GET /admin/users`
- `DELETE /admin/users/{id}`
- `POST /internal/users/sync`
- `GET /content/summary`
- `GET /content/courses`
- `GET /content/courses/{courseId}`
- `GET /content/nodes/{nodeId}`
- `GET /content/nodes/{nodeId}/exercises`
- `POST /content/exercises/{exerciseId}/check`
- `GET /content/placement-test`
- `POST /content/placement-test/grade`
- `GET /content/quests`

The complete request/response contract, schemas, examples, and error responses
are defined in [`openapi.yaml`](./openapi.yaml).

`/users/count`, `/profile`, `/settings/account`, `/admin/*`, and `/internal/users/sync` require the
`x-backend-api-key` header when `BACKEND_API_KEY` is set.

`/profile` and `/settings/account` also require `x-user-id`. The frontend gateway supplies
this header only after authenticating the current Clerk or local session.

## Content database

The backend applies SQL files from `backend/migrations` and imports the
versioned snapshot in `backend/data/content-v1.json` before starting. Regenerate
the snapshot after editing authored fixtures:

```bash
npm --prefix frontend run content:export
```

Both migration and seed are idempotent:

```bash
npm --prefix backend run migrate
npm --prefix backend run seed:content
```

Course, roadmap, lesson details, exercises, placement questions, answer keys,
and quest definitions are stored in PostgreSQL. Exercise list responses omit
answer keys; `POST /content/exercises/{exerciseId}/check` grades against the
private database payload and reveals feedback only after submission.

## Adminer

`docker compose up -d adminer` exposes Adminer on
`http://localhost:${ADMINER_PORT:-8080}`. Use:

- System: PostgreSQL
- Server: `db`
- Database: `duolingo`
- Username/password: the matching `POSTGRES_USER` and `POSTGRES_PASSWORD`
  values from Compose
