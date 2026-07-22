import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const LOCAL_SESSION_COOKIE = "local_session";

const isProtectedRoute = createRouteMatcher([
  "/learn(.*)",
  "/lesson(.*)",
  "/courses(.*)",
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
  "/leaderboard(.*)",
  "/onboarding(.*)",
  "/placement-test(.*)",
  "/profile(.*)",
  "/quests(.*)",
  "/settings(.*)"
]);

const isPublicAuthInfrastructure = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/auth/local(.*)",
]);

const remoteSessionMiddleware = (req: NextRequest) => {
  const hasLocalSession = Boolean(req.cookies.get(LOCAL_SESSION_COOKIE)?.value);

  if (isProtectedRoute(req) && !hasLocalSession) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
};

const clerkSessionMiddleware = clerkMiddleware(async (auth, req) => {
  const hasLocalSession = Boolean(req.cookies.get(LOCAL_SESSION_COOKIE)?.value);

  if (hasLocalSession && isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // If the user is not logged in and tries to access protected routes, auth.protect() redirects to sign-in
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);

    signInUrl.searchParams.set(
      "redirect",
      `${req.nextUrl.pathname}${req.nextUrl.search}`
    );

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Keep both the forms and their local auth API independent from Clerk.
  // This guarantees that email/password auth remains usable during a Clerk outage.
  if (isPublicAuthInfrastructure(req)) {
    return NextResponse.next();
  }

  if (process.env.REMOTE_API_URL) {
    return remoteSessionMiddleware(req);
  }

  return clerkSessionMiddleware(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
