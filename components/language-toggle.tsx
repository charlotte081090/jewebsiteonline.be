"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { swapLocale } from "@/lib/i18n/path";

type LanguageToggleProps = {
  locale: Locale;
  label: string;
  nlLabel: string;
  enLabel: string;
};

export function LanguageToggle({
  locale,
  label,
  nlLabel,
  enLabel,
}: LanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `jwo-locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(swapLocale(pathname || `/${locale}`, next));
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-border/80 bg-cream p-0.5 text-xs font-semibold"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => switchTo("nl")}
        aria-pressed={locale === "nl"}
        aria-label={nlLabel}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "nl"
            ? "bg-forest text-cream"
            : "text-forest-muted hover:text-forest"
        }`}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        aria-label={enLabel}
        className={`rounded px-2 py-1 transition-colors ${
          locale === "en"
            ? "bg-forest text-cream"
            : "text-forest-muted hover:text-forest"
        }`}
      >
        EN
      </button>
    </div>
  );
}
