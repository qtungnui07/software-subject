import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { LOCAL_SESSION_COOKIE } from "@/lib/local-session";
import { revokeLocalSessionToken } from "@/services/local-session-service";

export async function POST() {
  const cookieStore = await cookies();
  await revokeLocalSessionToken(cookieStore.get(LOCAL_SESSION_COOKIE)?.value);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(LOCAL_SESSION_COOKIE);

  return response;
}
