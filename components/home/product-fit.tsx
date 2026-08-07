"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref } from "@/lib/i18n/path";
import type { ProductFitItem } from "@/lib/i18n/dictionaries/types";

export function ProductFit() {
  const { locale, dict } = useLocaleContext();
  const t = dict.productFit;
  const [openId, setOpenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  const active = t.items.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  const drawer =
    mounted && active
      ? createPortal(
          <PackageFaqDrawer
            item={active}
            titleId={titleId}
            closeLabel={t.closeLabel}
            onClose={() => setOpenId(null)}
            pricingHref={anchorHref(locale, dict, "pricing")}
            pricingLabel={t.cta}
          />,
          document.body,
        )
      : null;

  return (
    <section
      id={dict.routes.anchors.faq}
      className="border-t border-border/70 bg-cream"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl text-left">
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{t.intro}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-7">
          {t.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-cream p-6 pt-8 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/20 hover:bg-cream-dark sm:p-7 sm:pt-9"
            >
              <span
                className="pointer-events-none absolute -right-10 top-4 w-36 rotate-45 bg-forest/12 py-1 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-forest-muted transition-colors group-hover:bg-terracotta/15 group-hover:text-terracotta"
                aria-hidden
              >
                {item.packageName}
              </span>
              <h3 className="pr-10 font-display text-xl font-bold text-forest sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted sm:text-base">
                {item.body}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-terracotta transition-colors group-hover:text-terracotta-hover">
                {t.openHint}
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </button>
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

      {drawer}
    </section>
  );
}

function PackageFaqDrawer({
  item,
  titleId,
  closeLabel,
  onClose,
  pricingHref,
  pricingLabel,
}: {
  item: ProductFitItem;
  titleId: string;
  closeLabel: string;
  onClose: () => void;
  pricingHref: string;
  pricingLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
        aria-label={closeLabel}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-lg flex-col border-l border-border/70 bg-cream shadow-[-24px_0_60px_rgba(27,48,34,0.18)] animate-[drawer-in_320ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <h3
              id={titleId}
              className="font-display text-2xl font-bold tracking-tight text-forest"
            >
              {item.drawerTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.drawerIntro}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-forest transition-colors hover:border-terracotta/40 hover:text-terracotta"
            aria-label={closeLabel}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-7">
          <div className="divide-y divide-border/60">
            {item.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                  <span className="pt-0.5 text-sm font-medium text-forest sm:text-[0.95rem]">
                    {faq.question}
                  </span>
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-forest/15 text-forest transition-transform duration-300 group-open:rotate-45 group-open:border-terracotta/40 group-open:text-terracotta"
                    aria-hidden
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M7 2.5v9M2.5 7h9" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 px-5 py-5 sm:px-7">
          <SectionLink
            href={pricingHref}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            {pricingLabel}
          </SectionLink>
        </div>
      </aside>
    </div>
  );
}
