import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const BASE_URL = "https://jewebsiteonline.com";

export default function robots(): MetadataRoute.Robots {
  const thankYouPaths = locales.map(
    (locale) => `/${locale}/${getDictionary(locale).routes.thankYou}`,
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: thankYouPaths,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
