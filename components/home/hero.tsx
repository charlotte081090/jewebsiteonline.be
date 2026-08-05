"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";

export function Hero() {
  const { locale, dict } = useLocaleContext();

  return (
    <section
      id={dict.routes.anchors.top}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-cover-workspace.jpg"
          alt={dict.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
      </div>

      {/* Light wash — keep the photo visible, text readable */}
      <div
        className="absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(27,48,34,0.28) 0%, rgba(27,48,34,0.18) 45%, rgba(27,48,34,0.42) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-20 text-center md:px-8 md:py-28">
        <p className="animate-fade-up text-sm font-medium tracking-wide text-cream/90 sm:text-base">
          {dict.hero.eyebrow}
        </p>

        <h1 className="animate-fade-up delay-1 mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.15] tracking-tight text-cream sm:text-5xl md:text-6xl lg:text-[3.5rem] drop-shadow-[0_2px_18px_rgba(27,48,34,0.35)]">
          {dict.hero.title}
        </h1>

        <p className="animate-fade-up delay-2 mt-6 max-w-lg text-base leading-relaxed text-cream/90 sm:text-lg">
          {dict.hero.body}
        </p>

        <div className="animate-fade-up delay-2 mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href={anchorHref(locale, dict, "pricing")}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover sm:text-base"
          >
            {dict.hero.ctaPrimary}
          </Link>
          <Link
            href={anchorHref(locale, dict, "examples")}
            className="inline-flex items-center justify-center rounded-full border border-cream/55 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream hover:bg-cream/20 sm:text-base"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
