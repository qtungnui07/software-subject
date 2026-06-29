# Frontend service layer

Server-side modules in this directory are the only frontend modules that call
the backend service directly.

- `backend-client.ts` owns backend URL selection, API-key and user headers,
  JSON handling, timeouts, and local connection fallback.
- Domain services (`auth-service`, `profile-service`, `account-service`, and
  `admin-service`) expose typed operations to Route Handlers and Server
  Components.

Client Components should call a Next.js `/api/*` Route Handler. They must not
import these modules because the backend API key is server-only.

When adding a backend endpoint, add its typed operation to the relevant domain
service instead of calling `fetch` from a page or Route Handler.
