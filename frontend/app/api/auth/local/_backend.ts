import { NextResponse } from "next/server";

import { createLocalSessionToken, type LocalSessionUser, LOCAL_SESSION_COOKIE } from "@/lib/local-session";

export const setLocalSessionCookie = (response: NextResponse, user: LocalSessionUser) => {
  response.cookies.set(LOCAL_SESSION_COOKIE, createLocalSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};
