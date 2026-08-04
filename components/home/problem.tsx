"use client";

import Link from "next/link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";

export function Problem() {
  const { locale, dict } = useLocaleContext();

  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(192,127,99,0.28), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 20%, rgba(250,245,240,0.08), transparent 50%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,245,240,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(250,245,240,0.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 50%, black 20%, transparent 75%)",
        }}
      />

      <svg
        className="pointer-events-none absolute -right-8 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 text-cream/[0.07] md:right-[4%] md:h-[26rem] md:w-[26rem]"
        viewBox="0 0 320 320"
        fill="none"
        aria-hidden
      >
        <circle cx="140" cy="140" r="88" stroke="currentColor" strokeWidth="2" />
        <circle cx="140" cy="140" r="52" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M205 205 L268 268"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="140" cy="140" r="12" fill="currentColor" opacity="0.5" />
      </svg>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between md:gap-16 md:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta-soft">
            {dict.problem.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-cream md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {dict.problem.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
            {dict.problem.body}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href={anchorHref(locale, dict, "howItWorks", false)}
            className="inline-flex items-center gap-2 rounded-md bg-terracotta px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            {dict.problem.cta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
