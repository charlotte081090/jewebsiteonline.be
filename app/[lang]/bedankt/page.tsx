import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { homeHref } from "@/lib/i18n/path";

type BedanktPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    naam?: string | string[];
    order?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    title: dict.bedankt.metaTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BedanktPage({
  params,
  searchParams,
}: BedanktPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const query = await searchParams;
  const raw = query.naam;
  const name = (Array.isArray(raw) ? raw[0] : raw)?.trim() || "";
  const rawOrder = query.order;
  const order = (Array.isArray(rawOrder) ? rawOrder[0] : rawOrder)?.trim() || "";

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
      <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-height))] max-w-6xl items-center justify-center px-5 py-14 md:px-8 md:py-20">
        <div className="animate-fade-up w-full max-w-xl py-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/15 text-2xl text-terracotta">
            ✓
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-forest md:text-4xl">
            {name
              ? dict.bedankt.titleNamed.replace("{name}", name)
              : dict.bedankt.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
            {dict.bedankt.body}
          </p>
          {order ? (
            <p className="mx-auto mt-3 font-mono text-sm font-semibold tracking-wide text-forest">
              {dict.bedankt.orderLabel.replace("{order}", order)}
            </p>
          ) : null}
          <Link
            href={homeHref(lang, dict)}
            className="mt-8 inline-flex rounded-md bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            {dict.bedankt.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
