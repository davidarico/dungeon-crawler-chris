import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login, authentication-related routes, and WebSocket routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/socket") ||
    pathname === "/" ||
    pathname.includes("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If the user is not authenticated, redirect to login
  if (!token) {
    // Avoid redirect loops by directly returning to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Update the matcher to avoid processing login, auth, and WebSocket routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/socket).*)"],
};
