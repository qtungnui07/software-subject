import { NextResponse } from "next/server";

import { getBackendUrl, localAuthError, setLocalSessionCookie } from "../_backend";

export async function POST(req: Request) {
  const response = await fetch(`${getBackendUrl()}/auth/sign-up`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(await req.json()),
  });

  if (!response.ok) {
    return NextResponse.json({ error: await localAuthError(response) }, { status: response.status });
  }

  const data = await response.json();
  const nextResponse = NextResponse.json({ ok: true, user: data.user });
  setLocalSessionCookie(nextResponse, data.user);

  return nextResponse;
}
