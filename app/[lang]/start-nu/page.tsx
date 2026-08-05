import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefingForm } from "@/components/contact/briefing-form";
import { resolvePaidAccess } from "@/lib/paid-access";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { anchorHref, startHref } from "@/lib/i18n/path";

const BASE_URL = "https://jewebsiteonline.com";

type StartNuPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
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
    robots: {
      index: false,
      follow: false,
    },
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

function GateMessage({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-xl py-10 text-center">
      <h1 className="font-display text-3xl font-semibold text-forest md:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="mt-8 inline-flex rounded-md bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export default async function StartNuPage({
  params,
  searchParams,
}: StartNuPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const query = await searchParams;
  const raw = query.session_id;
  const sessionId = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  const access = await resolvePaidAccess(sessionId);
  const pricingHref = anchorHref(lang, dict, "pricing");

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
        {access.ok ? (
          <BriefingForm paidAccess={access.access} />
        ) : access.reason === "used" ? (
          <GateMessage
            title={dict.startNu.usedTitle}
            body={dict.startNu.usedBody}
            ctaLabel={dict.bedankt.backHome}
            ctaHref={anchorHref(lang, dict, "top")}
          />
        ) : access.reason === "unpaid" ? (
          <GateMessage
            title={dict.startNu.unpaidTitle}
            body={dict.startNu.unpaidBody}
            ctaLabel={dict.startNu.paywallCta}
            ctaHref={pricingHref}
          />
        ) : (
          <GateMessage
            title={dict.startNu.paywallTitle}
            body={dict.startNu.paywallBody}
            ctaLabel={dict.startNu.paywallCta}
            ctaHref={pricingHref}
          />
        )}
      </div>
    </div>
  );
}
