"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenuFace } from "@/components/mobile-menu-face";
import {
  MOBILE_NAV_KEYS,
  useMobileNav,
  type MobileNavKey,
} from "@/components/mobile-nav-context";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import {
  anchorHref,
  localePath,
  stripLocale,
} from "@/lib/i18n/path";
import { isHomeSectionSlug } from "@/lib/i18n/routes";

export function Header() {
  const { locale, dict } = useLocaleContext();
  const { open, setOpen, toggle, activeKey, setActiveKey } = useMobileNav();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const home = localePath(locale);
  const pathSlug = stripLocale(pathname).replace(/^\//, "");
  const isHome =
    pathname === home ||
    pathname === `${home}/` ||
    (!!pathSlug && isHomeSectionSlug(locale, pathSlug));
  const solid = !isHome || scrolled || open;
  const navLinks = MOBILE_NAV_KEYS.map((key) => ({
    key,
    href: anchorHref(locale, dict, key, isHome),
    label: dict.nav[key],
  }));
  const ctaHref = anchorHref(locale, dict, "pricing", isHome);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > 36);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    const fromPath = MOBILE_NAV_KEYS.find(
      (key) => dict.routes.anchors[key] === pathSlug,
    );
    if (fromPath) {
      setActiveKey(fromPath);
    }

    if (!isHome) return;

    const sections = MOBILE_NAV_KEYS.map((key) => ({
      key,
      el: document.getElementById(dict.routes.anchors[key]),
    })).filter(
      (s): s is { key: MobileNavKey; el: HTMLElement } => Boolean(s.el),
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              b.intersectionRatio - a.intersectionRatio,
          );
        const top = visible[0];
        if (!top?.target?.id) return;
        const match = MOBILE_NAV_KEYS.find(
          (key) => dict.routes.anchors[key] === top.target.id,
        );
        if (match) setActiveKey(match);
      },
      {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0, 0.2, 0.45, 0.7],
      },
    );

    for (const section of sections) observer.observe(section.el);
    return () => observer.disconnect();
  }, [dict.routes.anchors, isHome, pathSlug, setActiveKey]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  function navClass(key: MobileNavKey) {
    const active = activeKey === key;
    if (active) {
      return "text-sm font-medium text-terracotta transition-colors";
    }
    return solid
      ? "text-sm font-medium text-forest-muted transition-colors hover:text-terracotta"
      : "text-sm font-medium text-cream/85 transition-colors hover:text-cream";
  }

  /* Non-home: same rounded hero-shaped flip panel (home uses the real hero) */
  const nonHomeMenu =
    mounted && !isHome
      ? createPortal(
          <div className="lg:hidden" aria-hidden={!open}>
            <div
              className={`fixed inset-0 z-[80] bg-cream transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <div
              className={`fixed inset-3 z-[90] transition-opacity duration-300 md:inset-4 ${
                open
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <div className="hero-flip-scene h-full">
                <div
                  className={`hero-flip-card relative h-[calc(100dvh-1.5rem)] md:h-[calc(100dvh-2rem)] ${
                    open ? "hero-flip-card--open" : ""
                  }`}
                >
                  <div className="hero-flip-face absolute inset-0 overflow-hidden rounded-[1.5rem] bg-cream-dark md:rounded-[2rem]" />
                  <div className="hero-flip-face hero-flip-face--back absolute inset-0 overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
                    <MobileMenuFace isHome={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
        <div
          className={`pointer-events-auto mx-auto max-w-6xl px-5 transition-[padding] duration-300 sm:px-5 md:px-8 ${
            solid ? "pt-[15px] md:pt-[19px]" : "pt-[25px] md:pt-[29px]"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 rounded-full px-3 py-2.5 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 sm:gap-4 sm:px-4 sm:py-3 ${
              solid
                ? "border border-border/50 bg-cream shadow-[0_10px_40px_rgba(27,48,34,0.12)]"
                : "border border-cream/25 bg-cream/12 shadow-none backdrop-blur-md"
            }`}
          >
            <BrandLogo
              size="md"
              label={dict.brand.homeAria}
              tone={solid ? "dark" : "light"}
            />

            <nav
              className="hidden flex-1 items-center justify-center gap-7 lg:flex"
              aria-label={dict.nav.mainNav}
            >
              {navLinks.map((link) => (
                <SectionLink
                  key={link.key}
                  href={link.href}
                  className={navClass(link.key)}
                  aria-current={activeKey === link.key ? "true" : undefined}
                >
                  {link.label}
                </SectionLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageToggle
                  locale={locale}
                  label={dict.languageToggle.label}
                  nlLabel={dict.languageToggle.nl}
                  enLabel={dict.languageToggle.en}
                  tone={solid ? "dark" : "light"}
                />
              </div>

              <SectionLink
                href={ctaHref}
                className="hidden rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover sm:inline-flex"
              >
                {dict.nav.cta}
              </SectionLink>

              <button
                type="button"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors lg:hidden ${
                  solid
                    ? "border-border text-forest"
                    : "border-cream/35 text-cream"
                }`}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
                onClick={() => toggle({ scrollHomeFirst: isHome })}
              >
                <span className="sr-only">Menu</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  {open ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {!isHome ? (
        <div
          className="h-[calc(var(--site-header-height)+1.25rem)]"
          aria-hidden
        />
      ) : null}

      {nonHomeMenu}
    </>
  );
}
