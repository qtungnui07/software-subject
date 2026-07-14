# Robogo frontend

The canonical VPS owns PostgreSQL and all durable learning data. A cloned
frontend does not need `DATABASE_URL`; it proxies API traffic through the
public Robogo gateway.

## Run a clone

```bash
cp .env.example .env.local
npm install
npm run dev
```

The important setting is:

```env
REMOTE_API_URL=https://api-robogo.qtitpc.dev
```

Do not put a PostgreSQL connection string or `BACKEND_API_KEY` in a cloned
frontend. Browser requests stay same-origin at `/api/*`; Next.js forwards them
to the gateway, including the local-session cookie. Server-rendered pages use
the same gateway for authentication, courses, and user progress.

## Canonical VPS

Leave `REMOTE_API_URL` unset on `robogo.qtitpc.dev`. The canonical instance
executes its API routes against PostgreSQL and is reached internally by the
Node gateway at `http://frontend:3000`.
