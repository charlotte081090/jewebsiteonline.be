"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroPulse } from "@/components/home/hero-pulse";
import { useLocaleContext } from "@/components/locale-provider";
import { startHref } from "@/lib/i18n/path";

export function Hero() {
  const { locale, dict } = useLocaleContext();

  return (
    <section id={dict.routes.anchors.top} className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 42% 48% at 78% 42%, rgba(192,127,99,0.12), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-var(--site-header-height)-5rem)] w-full max-w-6xl flex-col justify-center gap-10 px-5 py-14 md:px-8 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-20 lg:pr-0">
        <div className="relative z-10 w-full max-w-xl lg:max-w-[28.5rem] lg:shrink-0">
          <h1 className="animate-fade-up font-display text-4xl font-semibold leading-[1.12] tracking-tight text-forest sm:text-5xl lg:text-[3.05rem] xl:text-[3.25rem]">
            {dict.hero.title}
          </h1>
          <p className="animate-fade-up delay-1 mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            {dict.hero.body}
          </p>

          <div className="animate-fade-up delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={startHref(locale, dict)}
              className="inline-flex items-center justify-center rounded-md bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover sm:text-base"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <a
              href={`#${dict.routes.anchors.examples}`}
              className="inline-flex items-center justify-center rounded-md border border-forest/25 bg-transparent px-6 py-3.5 text-sm font-semibold text-forest transition-colors hover:border-forest/50 hover:bg-cream-dark/60 sm:text-base"
            >
              {dict.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="animate-fade-up delay-2 relative flex w-full flex-col items-center gap-5 lg:w-[min(36rem,46vw)] lg:max-w-none lg:shrink-0 lg:items-end lg:translate-x-3 xl:w-[min(38rem,44vw)] xl:translate-x-5">
          <Image
            src="/hero-devices.jpg"
            alt={dict.hero.imageAlt}
            width={1024}
            height={576}
            priority
            sizes="(max-width: 640px) 28rem, (max-width: 1024px) 32rem, min(38rem, 44vw)"
            className="h-auto w-full max-w-md sm:max-w-lg lg:ml-auto lg:max-w-none"
          />

          <HeroPulse />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8">
        <ul className="flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
          {dict.hero.bullets.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm font-medium text-forest-muted"
            >
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
