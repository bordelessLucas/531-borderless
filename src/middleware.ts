import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIES, verifyFirebaseIdToken } from "@/features/auth/session";

function parseEmailList(envValue: string | undefined): Set<string> {
  return new Set(
    (envValue ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function resolveRole(email: string | null, claimRole: string | null, cookieRole: string | null) {
  if (claimRole === "admin" || claimRole === "operator") return claimRole;
  const normalized = email?.toLowerCase() ?? "";
  if (normalized && parseEmailList(process.env.ADMIN_EMAILS).has(normalized)) {
    return "admin";
  }
  if (normalized && parseEmailList(process.env.OPERATOR_EMAILS).has(normalized)) {
    return "operator";
  }
  if (cookieRole === "admin" || cookieRole === "operator" || cookieRole === "customer") {
    return cookieRole;
  }
  return "customer";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/conta");
  const isAuthPage = pathname === "/login" || pathname === "/registro";

  if (!isAdmin && !isAccount && !isAuthPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIES.session)?.value;
  const cookieRole = request.cookies.get(AUTH_COOKIES.role)?.value ?? null;

  let uid: string | null = null;
  let email: string | null = null;
  let role = "customer";

  if (token) {
    try {
      const verified = await verifyFirebaseIdToken(token);
      uid = verified.uid;
      email = verified.email;
      role = resolveRole(verified.email, verified.role, cookieRole);
    } catch {
      uid = null;
    }
  }

  if (isAuthPage) {
    if (uid) {
      const dest = role === "admin" || role === "operator" ? "/admin" : "/conta";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!uid) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const res = NextResponse.redirect(login);
    res.cookies.delete(AUTH_COOKIES.session);
    res.cookies.delete(AUTH_COOKIES.role);
    return res;
  }

  if (isAdmin && role !== "admin" && role !== "operator") {
    return NextResponse.redirect(new URL("/conta", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*", "/login", "/registro"],
};
