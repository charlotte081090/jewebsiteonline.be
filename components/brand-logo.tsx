"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocaleContext } from "@/components/locale-provider";
import { homeHref, localePath } from "@/lib/i18n/path";

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  /** `light` = white “Je Website” (over hero). `dark` = dark “Je Website” (scrolled / footer). */
  tone?: "dark" | "light";
};

const sizeClasses = {
  sm: "h-7 sm:h-8",
  md: "h-8 sm:h-9",
  lg: "h-10 sm:h-12",
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
  const aria = label ?? dict.brand.homeAria;

  const mark = (
    <span
      className={`relative inline-flex ${sizeClasses[size]} aspect-[1024/319] w-auto max-w-[11rem] sm:max-w-[13.5rem] ${className}`}
    >
      <Image
        src="/logo-header-light.webp"
        alt=""
        fill
        sizes="180px"
        priority={tone === "light"}
        className={`object-contain object-left transition-opacity duration-300 ${
          tone === "light" ? "opacity-100" : "opacity-0"
        }`}
      />
      <Image
        src="/logo-header-dark.webp"
        alt=""
        fill
        sizes="180px"
        priority={tone === "dark"}
        className={`object-contain object-left transition-opacity duration-300 ${
          tone === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className="sr-only">{aria}</span>
    </span>
  );

  if (!target) {
    return mark;
  }

  return (
    <Link
      href={target}
      className="inline-flex min-w-0 shrink items-center"
      aria-label={aria}
      onClick={(event) => {
        const onHome =
          pathname === home ||
          pathname === `${home}/` ||
          pathname === homeSection;
        if (!onHome) return;
        if (target !== homeSection && target !== home) return;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "auto" });
        window.history.replaceState(null, "", homeSection);
      }}
    >
      {mark}
    </Link>
  );
}
