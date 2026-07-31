import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/types";

export function localePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  if (parts[0] === "nl" || parts[0] === "en") {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function swapLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "nl" || parts[0] === "en") {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }
  return localePath(nextLocale, pathname);
}

export function homeHref(locale: Locale, dict: Dictionary): string {
  return localePath(locale, `#${dict.routes.anchors.top}`);
}

export function startHref(locale: Locale, dict: Dictionary): string {
  return localePath(locale, dict.routes.start);
}

export function privacyHref(locale: Locale, dict: Dictionary, hash?: string): string {
  const base = localePath(locale, dict.routes.privacy);
  return hash ? `${base}#${hash}` : base;
}

export function termsHref(locale: Locale, dict: Dictionary): string {
  return localePath(locale, dict.routes.terms);
}

export function thankYouHref(locale: Locale, dict: Dictionary): string {
  return localePath(locale, dict.routes.thankYou);
}

export function anchorHref(
  locale: Locale,
  dict: Dictionary,
  key: keyof Dictionary["routes"]["anchors"],
  isHome: boolean,
): string {
  const id = dict.routes.anchors[key];
  return isHome ? `#${id}` : `${localePath(locale)}#${id}`;
}
