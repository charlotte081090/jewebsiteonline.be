"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocaleContext } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n/path";

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
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
}: BrandLogoProps) {
  const { locale, dict } = useLocaleContext();
  const pathname = usePathname();

  const topId = dict.routes.anchors.top;
  const home = localePath(locale);
  const homeWithAnchor = `${home}#${topId}`;
  const target = href ?? homeWithAnchor;

  const mark = (
    <span
      className={`font-display font-semibold tracking-tight text-forest ${sizeClasses[size]} ${className}`}
    >
      Jewebsiteonline
      <span className="text-terracotta">.com</span>
    </span>
  );

  if (!target) {
    return mark;
  }

  return (
    <Link
      href={target}
      className="inline-flex shrink-0 items-center"
      aria-label={label ?? dict.brand.homeAria}
      onClick={(event) => {
        if (target !== homeWithAnchor && target !== home) return;
        if (pathname !== home && pathname !== `${home}/`) return;
        event.preventDefault();
        const hero = document.getElementById(topId);
        if (hero) {
          hero.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.history.replaceState(null, "", homeWithAnchor);
      }}
    >
      {mark}
    </Link>
  );
}
