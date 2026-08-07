"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

function sectionIdFromHref(href: string) {
  const clean = href.split("#")[0]?.replace(/\/+$/, "") ?? "";
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function scrollToSection(sectionId: string) {
  if (sectionId === "home" || sectionId === "") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

type SectionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/**
 * Home section links scroll smoothly to the target section.
 * Same-route clicks also re-scroll after the user has scrolled away.
 */
export function SectionLink({ href, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    const target = href.split("#")[0]?.replace(/\/+$/, "") || "/";
    const parts = target.split("/").filter(Boolean);
    // Only intercept /{locale}/{section} home anchors
    if (parts.length !== 2) return;

    event.preventDefault();
    const sectionId = sectionIdFromHref(href);
    const current = pathname.replace(/\/+$/, "") || "/";

    if (current !== target) {
      router.push(target, { scroll: false });
    }
    // Scroll immediately; SectionScroll also runs after route updates
    requestAnimationFrame(() => scrollToSection(sectionId));
    window.setTimeout(() => scrollToSection(sectionId), 0);
  }

  return <Link href={href} onClick={handleClick} scroll={false} {...props} />;
}
