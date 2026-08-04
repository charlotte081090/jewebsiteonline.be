import { notFound } from "next/navigation";
import { HomePage } from "@/components/home/home-page";
import { SectionScroll } from "@/components/section-scroll";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isHomeSectionSlug } from "@/lib/i18n/routes";

export function generateStaticParams() {
  const params: { lang: string; section: string }[] = [];
  for (const lang of locales) {
    const anchors = getDictionary(lang).routes.anchors;
    for (const section of Object.values(anchors)) {
      params.push({ lang, section });
    }
  }
  return params;
}

export default async function HomeSectionPage({
  params,
}: {
  params: Promise<{ lang: string; section: string }>;
}) {
  const { lang, section } = await params;
  if (!isLocale(lang) || !isHomeSectionSlug(lang as Locale, section)) {
    notFound();
  }

  return (
    <>
      <SectionScroll sectionId={section} />
      <HomePage />
    </>
  );
}
