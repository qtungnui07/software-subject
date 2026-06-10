import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route yêu cầu đăng nhập
const protectedRoutes = ["/dashboard"];

// Các route chỉ dành cho người chưa đăng nhập
const authRoutes = ["/sign-in", "/sign-up"];

// NextAuth v5 với proxy convention: auth() wraps the handler
// req.auth sẽ chứa session nếu đã đăng nhập
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Chưa đăng nhập mà vào route protected → redirect về sign-in
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  // Đã đăng nhập mà vào sign-in/sign-up → redirect về trang chủ
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
