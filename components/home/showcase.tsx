"use client";

import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";

const DESIGNS = Array.from({ length: 9 }, (_, i) => ({
  src: `/examples/grid/${String(i + 1).padStart(2, "0")}.webp`,
}));

export function Showcase() {
  const { locale, dict } = useLocaleContext();
  const t = dict.showcase;

  return (
    <section id={dict.routes.anchors.examples} className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl text-left">
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl md:text-5xl md:leading-[1.1]">
            {t.title}
          </h2>
          {t.body ? (
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {t.body}
            </p>
          ) : null}
        </div>

        <div className="relative mt-12 md:mt-16">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
            {DESIGNS.map((design, i) => {
              const alt =
                t.items[i]?.alt ?? t.itemAlt.replace("{n}", String(i + 1));
              return (
                <li
                  key={design.src}
                  className={`group relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-cream-dark select-none ${
                    i >= 6 ? "hidden md:block" : ""
                  }`}
                >
                  <div
                    role="img"
                    aria-label={alt}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${design.src})` }}
                  />
                </li>
              );
            })}
          </ul>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[38%] items-end justify-center pb-5 sm:pb-6 md:h-[34%] md:pb-8"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 42%, rgba(255,255,255,0.96) 100%)",
              }}
            />
            <p className="relative font-display text-2xl font-bold tracking-tight text-forest sm:text-3xl md:text-4xl">
              {t.moreLabel}
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
          <SectionLink
            href={anchorHref(locale, dict, "pricing")}
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            {t.cta}
          </SectionLink>
        </div>
      </div>
    </section>
  );
}
