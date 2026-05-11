import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isPublicFile = pathname.startsWith("/_next") || pathname === "/favicon.ico";

  if (isPublicFile) return NextResponse.next();

  const session = request.cookies.get("session")?.value;
  const authenticated = session === process.env.AUTH_SECRET;

  if (!authenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
