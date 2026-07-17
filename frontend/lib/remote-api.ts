import "server-only";

import { cookies } from "next/headers";

export const getRemoteApiUrl = () =>
  process.env.REMOTE_API_URL?.trim().replace(/\/$/, "") || null;

export const isRemoteApiMode = () => Boolean(getRemoteApiUrl());

export const remoteApiRequest = async <T>(
  path: `/${string}`,
  init: RequestInit = {},
): Promise<T> => {
  const baseUrl = getRemoteApiUrl();
  if (!baseUrl) throw new Error("REMOTE_API_URL is not configured");

  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${baseUrl}/frontend-api${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...init.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Remote API failed with status ${response.status}`);
  }

  return data as T;
};
