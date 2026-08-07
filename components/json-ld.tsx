import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const BASE_URL = "https://jewebsiteonline.com";

type JsonLdProps = {
  locale: Locale;
  dict: Dictionary;
};

export function JsonLd({ locale, dict }: JsonLdProps) {
  const url = `${BASE_URL}/${locale}`;
  const inLanguage = locale === "en" ? "en" : "nl-BE";

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: dict.meta.siteName,
    url,
    logo: `${BASE_URL}/logo.png`,
    email: "info@jewebsiteonline.com",
    areaServed: {
      "@type": "Country",
      name: "Belgium",
    },
    description: dict.meta.description,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.meta.siteName,
    url,
    inLanguage,
  };

  const faqItems = dict.productFit.items.flatMap((item) => item.faqs);
  const seen = new Set<string>();
  const uniqueFaqs = faqItems.filter((item) => {
    if (seen.has(item.question)) return false;
    seen.add(item.question);
    return true;
  });

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage,
    mainEntity: uniqueFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const payloads = [organization, website, faqPage];

  return (
    <>
      {payloads.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
