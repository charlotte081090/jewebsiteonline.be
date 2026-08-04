"use client";

import { useLocaleContext } from "@/components/locale-provider";

export function Usps() {
  const { dict } = useLocaleContext();

  return (
    <section className="border-t border-border/60 bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
          {dict.hero.bullets.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-forest-muted sm:text-[0.95rem]"
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
