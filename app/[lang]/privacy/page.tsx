import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalSections } from "@/components/legal/legal-sections";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { homeHref, privacyHref } from "@/lib/i18n/path";

const BASE_URL = "https://jewebsiteonline.com";

type PrivacyPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    title: dict.privacy.metaTitle,
    description: dict.privacy.metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${BASE_URL}${privacyHref(lang, dict)}`,
      languages: {
        "nl-BE": `${BASE_URL}${privacyHref("nl", getDictionary("nl"))}`,
        en: `${BASE_URL}${privacyHref("en", getDictionary("en"))}`,
        "x-default": `${BASE_URL}${privacyHref("nl", getDictionary("nl"))}`,
      },
    },
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-forest">
        {dict.privacy.title}
      </h1>
      <p className="mt-3 text-sm text-muted">{dict.privacy.updated}</p>

      <div className="prose-privacy mt-10 space-y-10 text-base leading-relaxed text-forest-muted">
        <LegalSections sections={dict.privacy.sections} />

        <p className="pt-4">
          <Link
            href={homeHref(lang, dict)}
            className="font-medium text-terracotta underline-offset-2 hover:underline"
          >
            {dict.privacy.backHome}
          </Link>
        </p>
      </div>
    </article>
  );
}
