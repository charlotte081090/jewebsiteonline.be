"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { swapLocale } from "@/lib/i18n/path";

type LanguageToggleProps = {
  locale: Locale;
  label: string;
  nlLabel: string;
  enLabel: string;
  tone?: "dark" | "light";
};

export function LanguageToggle({
  locale,
  label,
  nlLabel,
  enLabel,
  tone = "dark",
}: LanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLight = tone === "light";

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `jwo-locale=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(swapLocale(pathname || `/${locale}`, next));
  }

  return (
    <div
      className={`inline-flex items-center rounded-full p-0.5 text-xs font-semibold ${
        isLight
          ? "border border-cream/30 bg-cream/10"
          : "border border-border/80 bg-cream"
      }`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => switchTo("nl")}
        aria-pressed={locale === "nl"}
        aria-label={nlLabel}
        className={`rounded-full px-2 py-1 transition-colors ${
          locale === "nl"
            ? isLight
              ? "bg-cream text-forest"
              : "bg-forest text-cream"
            : isLight
              ? "text-cream/75 hover:text-cream"
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
        className={`rounded-full px-2 py-1 transition-colors ${
          locale === "en"
            ? isLight
              ? "bg-cream text-forest"
              : "bg-forest text-cream"
            : isLight
              ? "text-cream/75 hover:text-cream"
              : "text-forest-muted hover:text-forest"
        }`}
      >
        EN
      </button>
    </div>
  );
}
