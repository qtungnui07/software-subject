import "server-only";

export type BackendErrorBody = {
  error: string;
};

export type BackendResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: BackendErrorBody };

type BackendRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  userId?: string;
  body?: unknown;
  cache?: RequestCache;
  timeoutMs?: number;
};

const getBackendUrls = () =>
  process.env.BACKEND_URL
    ? [process.env.BACKEND_URL.replace(/\/$/, "")]
    : ["http://duolingo-backend:4000", "http://127.0.0.1:4000"];

const normalizeError = (data: unknown, fallback: string): BackendErrorBody => ({
  error:
    typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
      ? data.error
      : fallback,
});

export const backendRequest = async <T>(
  path: `/${string}`,
  options: BackendRequestOptions = {}
): Promise<BackendResult<T>> => {
  const { method = "GET", userId, body, cache = "no-store", timeoutMs = 5000 } = options;
  let lastError: unknown;

  for (const backendUrl of getBackendUrls()) {
    try {
      const response = await fetch(`${backendUrl}${path}`, {
        method,
        headers: {
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          ...(userId ? { "x-user-id": userId } : {}),
          ...(process.env.BACKEND_API_KEY
            ? { "x-backend-api-key": process.env.BACKEND_API_KEY }
            : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        cache,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const data: unknown = await response.json().catch(() => null);

      if (response.ok) {
        return { ok: true, status: response.status, data: data as T };
      }

      return {
        ok: false,
        status: response.status,
        data: normalizeError(data, `Backend request failed with status ${response.status}`),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Backend is unavailable");
};
