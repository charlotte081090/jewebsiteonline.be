"use client";

import { useLocaleContext } from "@/components/locale-provider";

export function Faq() {
  const { dict } = useLocaleContext();

  return (
    <section
      id={dict.routes.anchors.faq}
      className="border-t border-border/70 bg-cream"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-terracotta">
            {dict.faq.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest md:text-4xl">
            {dict.faq.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{dict.faq.intro}</p>
        </div>

        <div className="mt-12 divide-y divide-border/80 border-y border-border/80">
          {dict.faq.items.map((item) => (
            <details
              key={item.question}
              className="group py-5 open:pb-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                <span className="font-display text-lg font-semibold text-forest md:text-xl">
                  {item.question}
                </span>
                <span
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-forest/15 text-forest transition-transform duration-300 group-open:rotate-45"
                  aria-hidden
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  >
                    <path d="M7 2.5v9M2.5 7h9" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
