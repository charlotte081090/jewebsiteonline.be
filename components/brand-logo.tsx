"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  href = "/",
  className = "",
  size = "md",
  label = "jewebsiteonline.be, naar homepagina",
}: BrandLogoProps) {
  const pathname = usePathname();
  const mark = (
    <span
      className={`font-display font-semibold tracking-tight text-forest ${sizeClasses[size]} ${className}`}
    >
      Jewebsiteonline
      <span className="text-terracotta">.be</span>
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link
      href={href === "/" ? "/#top" : href}
      className="inline-flex shrink-0 items-center"
      aria-label={label}
      onClick={(event) => {
        if (href !== "/" && href !== "/#top") return;
        if (pathname !== "/") return;
        event.preventDefault();
        const hero = document.getElementById("top");
        if (hero) {
          hero.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.history.replaceState(null, "", "/#top");
      }}
    >
      {mark}
    </Link>
  );
}
