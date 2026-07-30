import { faqs } from "@/lib/faqs";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "jewebsiteonline.be",
  url: "https://jewebsiteonline.be",
  logo: "https://jewebsiteonline.be/logo.png",
  email: "info@jewebsiteonline.be",
  areaServed: {
    "@type": "Country",
    name: "Belgium",
  },
  description:
    "Professionele websites van 1 tot 3 pagina's voor Belgische KMO's. Gratis preview binnen 48 uur.",
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "jewebsiteonline.be",
  url: "https://jewebsiteonline.be",
  inLanguage: "nl-BE",
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function JsonLd() {
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
