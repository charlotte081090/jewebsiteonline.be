import type { Metadata } from "next";
import { BriefingForm } from "@/components/contact/briefing-form";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { startHref } from "@/lib/i18n/path";

const BASE_URL = "https://jewebsiteonline.com";

type StartNuPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: StartNuPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    title: dict.startNu.metaTitle,
    description: dict.startNu.metaDescription,
    alternates: {
      canonical: `${BASE_URL}${startHref(lang, dict)}`,
      languages: {
        "nl-BE": `${BASE_URL}${startHref("nl", getDictionary("nl"))}`,
        en: `${BASE_URL}${startHref("en", getDictionary("en"))}`,
        "x-default": `${BASE_URL}${startHref("nl", getDictionary("nl"))}`,
      },
    },
  };
}

export default function StartNuPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 88% 8%, rgba(192,127,99,0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 8% 70%, rgba(27,48,34,0.05), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100svh-4.75rem)] max-w-6xl items-start px-5 py-14 md:items-center md:px-8 md:py-20">
        <BriefingForm />
      </div>
    </div>
  );
}
