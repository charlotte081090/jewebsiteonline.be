"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocaleContext } from "@/components/locale-provider";
import { homeHref, localePath } from "@/lib/i18n/path";

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  tone?: "dark" | "light";
};

const sizeClasses = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-[1.65rem]",
  lg: "text-2xl sm:text-3xl",
};

export function BrandLogo({
  href,
  className = "",
  size = "md",
  label,
  tone = "dark",
}: BrandLogoProps) {
  const { locale, dict } = useLocaleContext();
  const pathname = usePathname();

  const home = localePath(locale);
  const homeSection = homeHref(locale, dict);
  const target = href ?? homeSection;
  const nameColor = tone === "light" ? "text-cream" : "text-forest";
  const accentColor =
    tone === "light" ? "text-terracotta-soft" : "text-terracotta";

  const mark = (
    <span
      className={`font-display font-semibold tracking-tight ${nameColor} ${sizeClasses[size]} ${className}`}
    >
      Jewebsiteonline
      <span className={accentColor}>.com</span>
    </span>
  );

  if (!target) {
    return mark;
  }

  return (
    <Link
      href={target}
      className="inline-flex min-w-0 shrink items-center"
      aria-label={label ?? dict.brand.homeAria}
      onClick={(event) => {
        const onHome =
          pathname === home ||
          pathname === `${home}/` ||
          pathname === homeSection;
        if (!onHome) return;
        if (target !== homeSection && target !== home) return;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", homeSection);
      }}
    >
      {mark}
    </Link>
  );
}
