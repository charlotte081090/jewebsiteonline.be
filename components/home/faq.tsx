"use client";

import { useState } from "react";
import { useLocaleContext } from "@/components/locale-provider";

export function Faq() {
  const { dict } = useLocaleContext();
  const [openId, setOpenId] = useState(dict.faq.sections[0]?.id ?? "");

  return (
    <section
      id={dict.routes.anchors.faq}
      className="border-t border-border/70 bg-cream"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest md:text-4xl">
            {dict.faq.title}
          </h2>
          <p className="mt-3 text-base text-muted md:text-lg">{dict.faq.intro}</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-cream-dark">
          {dict.faq.sections.map((section) => {
            const isOpen = openId === section.id;
            return (
              <div
                key={section.id}
                className="border-b border-border/60 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((current) =>
                      current === section.id ? "" : section.id,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-cream/60 sm:px-6"
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="block font-display text-lg font-bold text-forest sm:text-xl">
                      {section.title}
                    </span>
                    {section.intro ? (
                      <span className="mt-0.5 block text-sm text-muted">
                        {section.intro}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-forest/15 bg-cream text-forest transition-transform duration-300 ${
                      isOpen ? "rotate-45 border-terracotta/40 text-terracotta" : ""
                    }`}
                    aria-hidden
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M7 2.5v9M2.5 7h9" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="divide-y divide-border/60 border-t border-border/60 bg-cream px-5 sm:px-6">
                      {section.items.map((item) => (
                        <details
                          key={item.question}
                          className="group py-3.5 open:pb-4 [&_summary::-webkit-details-marker]:hidden"
                        >
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                            <span className="pt-0.5 text-sm font-medium text-forest sm:text-[0.95rem]">
                              {item.question}
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
                          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
                            {item.answer}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
