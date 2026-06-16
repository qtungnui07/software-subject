import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/learn(.*)",
  "/courses(.*)",
  "/dashboard(.*)"
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the user is logged in and tries to access sign-in/sign-up, redirect to /learn
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/learn", req.url));
  }

  // If the user is not logged in and tries to access protected routes, auth.protect() redirects to sign-in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/learn/:path*",
    "/courses/:path*",
    "/dashboard/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/sso-callback/:path*",
  ],
};
