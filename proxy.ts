import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { prisma } from "@/lib/prisma/client";
import { homeForRole, isAdminRole } from "@/lib/auth/role";

const PROTECTED_PREFIXES = [
  "/user",
  "/profile",
  "/bookmark",
  "/history",
  "/settings",
  "/bookmarks",
  "/catatan",
  "/favorites",
];
const ADMIN_PREFIXES = ["/admin"];
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

// Rute warisan → tujuan baru. 307 di proxy (tanpa render), semua role & status.
const LEGACY_REDIRECTS: Record<string, string> = {
  "/profile": "/user/dashboard/profile",
  "/settings": "/user/dashboard/settings",
  "/history": "/user/dashboard/history",
  "/bookmark": "/user/dashboard/bookmarks",
  "/bookmarks": "/user/dashboard/bookmarks",
  "/catatan": "/user/dashboard/notes",
  "/favorites": "/user/dashboard/favorites",
  "/dashboard/history": "/user/dashboard/history",
  "/dashboard/bookmarks": "/user/dashboard/bookmarks",
  "/dashboard/notes": "/user/dashboard/notes",
};

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

// Rute dinamis yang "streaming shell" lebih dulu (pakai cookies/searchParams),
// sehingga notFound() di page sudah telat mengubah status → tetap 200.
// Cek keberadaan slug di proxy supaya slug tak dikenal benar-benar 404.
// Hanya cek 1 segmen slug (format /prefix/[slug]) dan hanya slug tanpa titik.
async function isMissingDynamicSlug(pathname: string): Promise<boolean> {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return false;
  const [prefix, slug] = segments;
  if (!slug || slug.includes(".") || slug.includes("%")) return false;

  switch (prefix) {
    case "series":
      return !(await prisma.series.findFirst({ where: { slug, published: true }, select: { id: true } }));
    case "kategori":
      return !(await prisma.category.findFirst({
        where: { slug, series: { some: { series: { published: true } } } },
        select: { id: true },
      }));
    case "tag":
      return !(await prisma.tag.findFirst({
        where: { slug, series: { some: { series: { published: true } } } },
        select: { id: true },
      }));
    case "pemateri":
      return !(await prisma.speaker.findFirst({
        where: { slug, status: "ACTIVE", series: { some: { series: { published: true } } } },
        select: { id: true },
      }));
    case "kitab":
      return !(await prisma.seriesType.findFirst({
        where: { slug, series: { some: { published: true } } },
        select: { id: true },
      }));
    case "audio":
      return !(await prisma.audio.findFirst({
        where: { slug, published: true },
        select: { id: true },
      }));
    default:
      return false;
  }
}

/** Role dari session token (kolom `sessions.token`). Null bila tak dapat di-resolve. */
async function getSessionRole(request: NextRequest): Promise<string | null> {
  const cookie = getSessionCookie(request);
  if (!cookie) return null;
  const token = decodeURIComponent(cookie).split(".")[0];
  if (!token) return null;
  const session = await prisma.session.findFirst({
    where: { token },
    select: { user: { select: { role: true } } },
  });
  return session?.user?.role ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));

  if (await isMissingDynamicSlug(pathname)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  const legacyTarget = LEGACY_REDIRECTS[pathname];
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url));
  }

  // /dashboard → home sesuai role (bukan dashboard utama lagi).
  if (pathname === "/dashboard") {
    if (hasSession) {
      const role = await getSessionRole(request);
      if (role) return NextResponse.redirect(new URL(homeForRole(role), request.url));
      // Role tak ter-resolve → serahkan ke server page /dashboard.
    } else {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // Pemisahan role area: USER dilarang /admin/*, ADMIN dilarang /user/*.
  if (hasSession && (pathname === "/user" || pathname.startsWith("/user/") || pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const role = await getSessionRole(request);
    if (role) {
      if (isAdminRole(role) && (pathname === "/user" || pathname.startsWith("/user/"))) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (!isAdminRole(role) && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }
    }
  }

  if (matchesAny(pathname, PROTECTED_PREFIXES) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesAny(pathname, ADMIN_PREFIXES) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesAny(pathname, AUTH_PATHS) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
