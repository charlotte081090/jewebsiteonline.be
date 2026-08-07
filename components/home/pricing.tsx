"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { useLocaleContext } from "@/components/locale-provider";
import type { PricingPackageId } from "@/lib/stripe";

const FEATURED_PACKAGE_ID = "three-page";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureTooltip({
  label,
  tip,
  featured,
}: {
  label: string;
  tip: string;
  featured: boolean;
}) {
  return (
    <span className="group/tip relative min-w-0">
      {label}
      {"\u00A0"}
      <button
        type="button"
        className={`relative -top-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border align-middle text-[0.65rem] font-semibold leading-none transition-colors ${
          featured
            ? "border-cream/35 text-cream/80 hover:border-cream hover:text-cream"
            : "border-forest/25 text-forest-muted hover:border-terracotta hover:text-terracotta"
        }`}
        aria-label={tip}
      >
        ?
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-20 w-56 -translate-x-1/2 rounded-lg px-3 py-2.5 text-left text-xs font-normal leading-relaxed opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${
            featured ? "bg-cream text-forest" : "bg-forest text-cream"
          }`}
        >
          {tip}
          <span
            className={`absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent ${
              featured ? "border-t-cream" : "border-t-forest"
            }`}
            aria-hidden
          />
        </span>
      </button>
    </span>
  );
}

export function Pricing() {
  const { locale, dict } = useLocaleContext();
  const why = dict.pricing.whyChooseUs;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCheckout(packageId: PricingPackageId) {
    setError(null);
    setPendingId(packageId);
    startTransition(async () => {
      const result = await createCheckoutSession({ packageId, locale });
      if (!result.ok) {
        setError(result.error || dict.pricing.checkoutError);
        setPendingId(null);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <section
      id={dict.routes.anchors.pricing}
      className="border-t border-border/70 bg-cream-dark"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl text-left">
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest md:text-4xl">
            {dict.pricing.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{dict.pricing.intro}</p>
        </div>

        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
            {dict.pricing.packages.map((pkg) => {
              const featured = pkg.id === FEATURED_PACKAGE_ID;
              const busy = isPending && pendingId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`relative flex h-full flex-col rounded-xl p-5 transition-transform duration-300 sm:p-6 md:p-7 ${
                    featured
                      ? "bg-forest text-cream shadow-[0_16px_40px_-12px_rgba(27,48,34,0.55)] md:-my-3 md:py-9"
                      : "bg-cream"
                  }`}
                >
                  {featured ? (
                    <span className="absolute right-4 top-4 inline-flex rounded-full bg-terracotta px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cream">
                      {dict.pricing.mostPopular}
                    </span>
                  ) : null}

                  <div className="flex flex-wrap items-baseline gap-2 pr-20">
                    <p
                      className={`font-display text-4xl font-bold tracking-tight ${
                        featured ? "text-cream" : "text-forest"
                      }`}
                    >
                      {pkg.price}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        featured ? "text-cream/55" : "text-muted"
                      }`}
                    >
                      {dict.pricing.exclVat}
                    </span>
                    {pkg.wasPrice ? (
                      <span
                        className={`font-display text-lg font-bold line-through ${
                          featured
                            ? "text-cream/45 decoration-cream/40"
                            : "text-muted decoration-terracotta/70"
                        }`}
                      >
                        {pkg.wasPrice}
                      </span>
                    ) : null}
                  </div>

                  <h3
                    className={`mt-4 font-display text-2xl font-bold ${
                      featured ? "text-cream" : "text-forest"
                    }`}
                  >
                    {pkg.name}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      featured ? "text-cream/70" : "text-muted"
                    }`}
                  >
                    {pkg.description}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5">
                    <li
                      className={`flex items-start gap-2.5 text-sm ${
                        featured ? "text-cream/90" : "text-forest-muted"
                      }`}
                    >
                      <CheckIcon
                        className={`mt-0.5 shrink-0 ${
                          featured ? "text-cream" : "text-forest"
                        }`}
                      />
                      <FeatureTooltip
                        label={pkg.pageLabel}
                        tip={pkg.pageTooltip}
                        featured={featured}
                      />
                    </li>
                    {pkg.highlights.map((h) => (
                      <li
                        key={h}
                        className={`flex items-start gap-2.5 text-sm ${
                          featured ? "text-cream/90" : "text-forest-muted"
                        }`}
                      >
                        <CheckIcon
                          className={`mt-0.5 shrink-0 ${
                            featured ? "text-cream" : "text-forest"
                          }`}
                        />
                        {h}
                      </li>
                    ))}
                    <li
                      className={`flex items-start gap-2.5 text-sm ${
                        featured ? "text-cream/90" : "text-forest-muted"
                      }`}
                    >
                      <CheckIcon
                        className={`mt-0.5 shrink-0 ${
                          featured ? "text-cream" : "text-forest"
                        }`}
                      />
                      <FeatureTooltip
                        label={pkg.domainLabel}
                        tip={pkg.domainTooltip}
                        featured={featured}
                      />
                    </li>
                    {(pkg.extras ?? []).map((h) => (
                      <li
                        key={h}
                        className={`flex items-start gap-2.5 text-sm ${
                          featured ? "text-cream/90" : "text-forest-muted"
                        }`}
                      >
                        <CheckIcon
                          className={`mt-0.5 shrink-0 ${
                            featured ? "text-cream" : "text-forest"
                          }`}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startCheckout(pkg.id as PricingPackageId)
                      }
                      className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        featured
                          ? "bg-terracotta text-cream hover:bg-terracotta-hover"
                          : "bg-forest/10 text-forest hover:bg-forest/15"
                      }`}
                    >
                      {busy ? dict.pricing.redirecting : pkg.cta}
                    </button>
                    <p
                      className={`mt-2 text-center text-xs ${
                        featured ? "text-cream/55" : "text-muted"
                      }`}
                    >
                      {dict.pricing.oneTimeCost}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        {error ? (
          <p className="mt-4 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-border/50 bg-cream md:mt-10">
          <div className="grid md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div
              role="img"
              aria-label={why.imageAlt}
              className="aspect-square select-none bg-cream-dark bg-cover bg-center [clip-path:polygon(0_0,100%_0,100%_88%,0_100%)] md:aspect-auto md:h-full md:min-h-[16rem] md:[clip-path:polygon(0_0,100%_0,84%_100%,0_100%)]"
              style={{
                backgroundImage: "url(/why-choose-team.webp)",
                backgroundPosition: "center 45%",
              }}
            />

            <div className="relative z-10 flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-14 xl:px-16">
              <h3 className="font-display text-2xl font-bold tracking-tight text-forest md:text-3xl">
                {why.title}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {why.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-forest-muted md:text-base"
                  >
                    <CheckIcon className="mt-1 shrink-0 text-terracotta" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
