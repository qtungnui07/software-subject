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
- `POST /internal/users/sync`

`/users/count` and `/internal/users/sync` require `x-backend-api-key` when `BACKEND_API_KEY` is set.
