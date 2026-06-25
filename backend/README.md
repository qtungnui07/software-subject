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

The complete request/response contract, schemas, examples, and error responses
are defined in [`openapi.yaml`](./openapi.yaml).

`/users/count`, `/profile`, `/settings/account`, `/admin/*`, and `/internal/users/sync` require the
`x-backend-api-key` header when `BACKEND_API_KEY` is set.

`/profile` and `/settings/account` also require `x-user-id`. The frontend gateway supplies
this header only after authenticating the current Clerk or local session.
