"use client";

import { useLocaleContext } from "@/components/locale-provider";

function ThinCheck({ className }: { className?: string }) {
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
        d="M3.25 8.25L6.5 11.25L12.75 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Usps() {
  const { dict } = useLocaleContext();

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
          {dict.hero.bullets.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-forest-muted sm:text-[0.95rem]"
            >
              <ThinCheck className="shrink-0 text-terracotta" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
