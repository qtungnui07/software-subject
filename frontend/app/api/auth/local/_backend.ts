import { NextResponse } from "next/server";

import { type LocalSessionUser, LOCAL_SESSION_COOKIE } from "@/lib/local-session";
import { createPersistedLocalSession } from "@/services/local-session-service";

export const setLocalSessionCookie = async (response: NextResponse, user: LocalSessionUser) => {
  const session = await createPersistedLocalSession(user);

  response.cookies.set(LOCAL_SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });
};
