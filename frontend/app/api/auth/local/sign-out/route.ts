import { NextResponse } from "next/server";

import { LOCAL_SESSION_COOKIE } from "@/lib/local-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(LOCAL_SESSION_COOKIE);

  return response;
}
