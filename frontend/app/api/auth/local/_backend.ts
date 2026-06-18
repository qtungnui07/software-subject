import { NextResponse } from "next/server";

import { createLocalSessionToken, type LocalSessionUser, LOCAL_SESSION_COOKIE } from "@/lib/local-session";

export const getBackendUrl = () => process.env.BACKEND_URL || "http://duolingo-backend:4000";

export const setLocalSessionCookie = (response: NextResponse, user: LocalSessionUser) => {
  response.cookies.set(LOCAL_SESSION_COOKIE, createLocalSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const localAuthError = async (response: Response) => {
  try {
    const data = await response.json();
    return typeof data.error === "string" ? data.error : "Authentication failed";
  } catch {
    return "Authentication failed";
  }
};
