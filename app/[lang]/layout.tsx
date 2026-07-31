import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { JsonLd } from "@/components/json-ld";
import { LocaleProvider } from "@/components/locale-provider";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  const base = "https://jewebsiteonline.com";

  return {
    title: {
      default: dict.meta.title,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
    keywords: [...dict.meta.keywords],
    openGraph: {
      type: "website",
      locale: lang === "en" ? "en_GB" : "nl_BE",
      url: `${base}/${lang}`,
      siteName: dict.meta.siteName,
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${base}/${lang}`,
      languages: {
        "nl-BE": `${base}/nl`,
        en: `${base}/en`,
        "x-default": `${base}/nl`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDictionary(locale);

  return (
    <LocaleProvider locale={locale} dict={dict}>
      <JsonLd locale={locale} dict={dict} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </LocaleProvider>
  );
}
