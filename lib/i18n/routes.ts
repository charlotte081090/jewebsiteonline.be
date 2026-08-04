import type { Locale } from "./config";
import { getDictionary } from "./get-dictionary";
import type { Dictionary } from "./dictionaries/types";

export type AnchorKey = keyof Dictionary["routes"]["anchors"];
export type PageRouteKey = "start" | "thankYou" | "privacy" | "terms";

function toLocalePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

/** Physical App Router folders (Dutch) that EN public URLs rewrite onto. */
export const PAGE_FOLDER_BY_KEY: Record<PageRouteKey, string> = {
  start: "start-nu",
  thankYou: "bedankt",
  privacy: "privacy",
  terms: "voorwaarden",
};

export function isHomeSectionSlug(locale: Locale, slug: string): boolean {
  const anchors = getDictionary(locale).routes.anchors;
  return Object.values(anchors).includes(slug);
}

export function homeSectionKeys(locale: Locale): AnchorKey[] {
  return Object.keys(getDictionary(locale).routes.anchors) as AnchorKey[];
}

export function resolvePageRouteKey(
  locale: Locale,
  slug: string,
): PageRouteKey | null {
  const routes = getDictionary(locale).routes;
  for (const key of Object.keys(PAGE_FOLDER_BY_KEY) as PageRouteKey[]) {
    if (routes[key] === slug) return key;
  }
  return null;
}

/** Map a pathname to the equivalent path in another locale (section + page slugs). */
export function swapLocalizedPath(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  const current = parts[0];
  if (current !== "nl" && current !== "en") {
    return toLocalePath(nextLocale);
  }

  const from = getDictionary(current);
  const to = getDictionary(nextLocale);
  const slug = parts.slice(1).join("/");

  if (!slug) return toLocalePath(nextLocale);

  for (const key of Object.keys(PAGE_FOLDER_BY_KEY) as PageRouteKey[]) {
    if (slug === from.routes[key] || slug === PAGE_FOLDER_BY_KEY[key]) {
      return toLocalePath(nextLocale, to.routes[key]);
    }
  }

  for (const key of Object.keys(from.routes.anchors) as AnchorKey[]) {
    if (slug === from.routes.anchors[key]) {
      return toLocalePath(nextLocale, to.routes.anchors[key]);
    }
  }

  if (slug === "contact") return toLocalePath(nextLocale, "contact");

  return toLocalePath(nextLocale);
}
