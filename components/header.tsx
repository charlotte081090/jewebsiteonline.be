"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import {
  anchorHref,
  localePath,
  stripLocale,
} from "@/lib/i18n/path";
import { isHomeSectionSlug } from "@/lib/i18n/routes";

const NAV_KEYS = ["examples", "howItWorks", "pricing", "faq"] as const;

export function Header() {
  const { locale, dict } = useLocaleContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeKey, setActiveKey] = useState<(typeof NAV_KEYS)[number] | null>(
    null,
  );

  const home = localePath(locale);
  const pathSlug = stripLocale(pathname).replace(/^\//, "");
  const isHome =
    pathname === home ||
    pathname === `${home}/` ||
    (!!pathSlug && isHomeSectionSlug(locale, pathSlug));
  const solid = !isHome || scrolled;
  const navLinks = NAV_KEYS.map((key) => ({
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
    const fromPath = NAV_KEYS.find(
      (key) => dict.routes.anchors[key] === pathSlug,
    );
    if (fromPath) {
      setActiveKey(fromPath);
    }

    if (!isHome) return;

    const sections = NAV_KEYS.map((key) => ({
      key,
      el: document.getElementById(dict.routes.anchors[key]),
    })).filter((s): s is { key: (typeof NAV_KEYS)[number]; el: HTMLElement } =>
      Boolean(s.el),
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
        const match = NAV_KEYS.find(
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
  }, [dict.routes.anchors, isHome, pathSlug]);

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
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function navClass(key: (typeof NAV_KEYS)[number], mobile = false) {
    const active = activeKey === key;
    if (mobile) {
      return active
        ? "rounded-2xl px-3 py-3.5 font-display text-2xl font-bold text-terracotta transition-colors hover:bg-cream/10"
        : "rounded-2xl px-3 py-3.5 font-display text-2xl font-bold text-cream transition-colors hover:bg-cream/10 hover:text-terracotta-soft";
    }
    if (active) {
      return "text-sm font-medium text-terracotta transition-colors";
    }
    return solid
      ? "text-sm font-medium text-forest-muted transition-colors hover:text-terracotta"
      : "text-sm font-medium text-cream/85 transition-colors hover:text-cream";
  }

  const menu = mounted
    ? createPortal(
        <div className="lg:hidden" aria-hidden={!open}>
          <div
            className={`fixed inset-0 z-[80] bg-forest/40 backdrop-blur-[3px] transition-opacity duration-300 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.mobileMenu}
            className={`fixed inset-y-0 right-0 z-[90] flex h-[100dvh] w-[min(88vw,22rem)] flex-col border-l border-cream/25 bg-cream/18 backdrop-blur-xl transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open
                ? "translate-x-0 shadow-[-20px_0_60px_rgba(27,48,34,0.28)]"
                : "pointer-events-none translate-x-full shadow-none"
            }`}
            style={{
              background:
                "linear-gradient(165deg, rgba(250,245,240,0.22) 0%, rgba(27,48,34,0.55) 55%, rgba(27,48,34,0.72) 100%)",
            }}
          >
            <div className="flex items-center justify-end px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/35 text-cream transition-colors hover:border-cream/60 hover:bg-cream/10"
                aria-label={dict.nav.closeMenu}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-4"
              aria-label={dict.nav.mobileNav}
            >
              {navLinks.map((link) => (
                <SectionLink
                  key={link.key}
                  href={link.href}
                  className={navClass(link.key, true)}
                  aria-current={activeKey === link.key ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </SectionLink>
              ))}
            </nav>

            <div className="flex flex-col gap-3 border-t border-cream/20 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <LanguageToggle
                locale={locale}
                label={dict.languageToggle.label}
                nlLabel={dict.languageToggle.nl}
                enLabel={dict.languageToggle.en}
                tone="light"
              />
              <SectionLink
                href={ctaHref}
                className="inline-flex w-full items-center justify-center rounded-full bg-terracotta px-4 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
                onClick={() => setOpen(false)}
              >
                {dict.nav.cta}
              </SectionLink>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
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
                onClick={() => setOpen((v) => !v)}
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

      {menu}
    </>
  );
}
