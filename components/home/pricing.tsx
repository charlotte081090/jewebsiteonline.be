"use client";

import Link from "next/link";
import { useLocaleContext } from "@/components/locale-provider";
import { startHref } from "@/lib/i18n/path";

const FEATURED_PACKAGE_ID = "three-page";

export function Pricing() {
  const { locale, dict } = useLocaleContext();
  const ctaHref = startHref(locale, dict);

  return (
    <section
      id={dict.routes.anchors.pricing}
      className="border-t border-border/70 bg-cream-dark/35"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            {dict.pricing.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            {dict.pricing.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{dict.pricing.intro}</p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {dict.pricing.packages.map((pkg) => {
            const featured = pkg.id === FEATURED_PACKAGE_ID;
            return (
              <div
                key={pkg.id}
                className={`group relative flex h-full flex-col rounded-xl border p-8 transition-transform duration-300 ${
                  featured
                    ? "border-terracotta/50 bg-cream shadow-[6px_8px_0_0_rgba(27,48,34,0.12),10px_14px_28px_-8px_rgba(27,48,34,0.18)] ring-1 ring-terracotta/25 hover:-translate-y-1 hover:shadow-[8px_10px_0_0_rgba(27,48,34,0.14),12px_18px_32px_-8px_rgba(27,48,34,0.22)]"
                    : "border-border/80 bg-cream"
                }`}
              >
                <div className="min-h-5">
                  {featured ? (
                    <span className="inline-flex rounded-full bg-terracotta/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                      {dict.pricing.mostPopular}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-4 font-display text-3xl font-semibold text-forest">
                  {pkg.name}
                </h3>

                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  {pkg.wasPrice ? (
                    <span className="font-display text-2xl font-semibold text-muted line-through decoration-terracotta/70">
                      {pkg.wasPrice}
                    </span>
                  ) : null}
                  <p className="font-display text-5xl font-semibold tracking-tight text-forest">
                    {pkg.price}
                  </p>
                </div>

                <p className="mt-5 text-base leading-relaxed text-muted">
                  {pkg.description}
                </p>

                <ul className="mt-6 flex flex-col gap-2.5">
                  {pkg.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-sm text-forest-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Link
                    href={ctaHref}
                    className={`inline-flex w-full items-center justify-center rounded-md px-5 py-3.5 text-sm font-semibold transition-colors ${
                      featured
                        ? "bg-terracotta text-cream hover:bg-terracotta-hover"
                        : "border border-forest/25 bg-transparent text-forest hover:border-forest/45 hover:bg-cream-dark/60"
                    }`}
                  >
                    {pkg.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-border/80 bg-cream-dark/40 px-6 py-5">
          <p className="text-sm font-semibold text-forest">
            {dict.pricing.alwaysIncluded}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {dict.pricing.included.map((item) => (
              <li key={item} className="text-sm text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
