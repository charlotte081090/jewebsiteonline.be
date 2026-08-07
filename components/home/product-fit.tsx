"use client";

import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";

export function ProductFit() {
  const { locale, dict } = useLocaleContext();
  const t = dict.productFit;

  return (
    <section className="border-t border-border/70 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl text-left">
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{t.intro}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-7">
          {t.items.map((item) => (
            <article
              key={item.packageName}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-cream-dark p-6 pt-8 sm:p-7 sm:pt-9"
            >
              <span
                className="pointer-events-none absolute -right-10 top-4 w-36 rotate-45 bg-terracotta py-1 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-cream shadow-sm"
                aria-hidden
              >
                {item.packageName}
              </span>
              <h3 className="pr-10 font-display text-xl font-bold text-forest sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {item.body}
              </p>
              <p className="mt-4 text-sm font-medium text-forest-muted">
                {item.bestFor}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
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
