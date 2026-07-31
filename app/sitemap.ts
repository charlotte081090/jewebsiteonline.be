import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const BASE_URL = "https://jewebsiteonline.com";

type Entry = {
  /** Dictionary route key, `home` resolves to the locale root. */
  route: "home" | "start" | "privacy" | "terms";
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ENTRIES: Entry[] = [
  { route: "home", changeFrequency: "weekly", priority: 1 },
  { route: "start", changeFrequency: "monthly", priority: 0.9 },
  { route: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { route: "terms", changeFrequency: "yearly", priority: 0.3 },
];

function urlFor(locale: (typeof locales)[number], route: Entry["route"]) {
  const segment = getDictionary(locale).routes[route];
  return segment ? `${BASE_URL}/${locale}/${segment}` : `${BASE_URL}/${locale}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ENTRIES.flatMap((entry) =>
    locales.map((locale) => ({
      url: urlFor(locale, entry.route),
      lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {
        languages: {
          "nl-BE": urlFor("nl", entry.route),
          en: urlFor("en", entry.route),
          "x-default": urlFor("nl", entry.route),
        },
      },
    })),
  );
}
