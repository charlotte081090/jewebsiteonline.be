import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/config";

const COOKIE = "jwo-locale";

function negotiateLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const lang of preferred) {
    if (lang === "en" || lang.startsWith("en-")) return "en";
    if (lang === "nl" || lang.startsWith("nl-")) return "nl";
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files: favicon, images, etc.
  ) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];
  if (isLocale(segment)) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE, segment, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    response.headers.set("x-locale", segment);
    return response;
  }

  const locale = negotiateLocale(request);
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
