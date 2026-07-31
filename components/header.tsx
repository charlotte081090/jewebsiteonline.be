"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocaleContext } from "@/components/locale-provider";
import { anchorHref, localePath, startHref } from "@/lib/i18n/path";

const NAV_KEYS = ["howItWorks", "examples", "pricing", "reviews"] as const;

export function Header() {
  const { locale, dict } = useLocaleContext();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const home = localePath(locale);
  const isHome = pathname === home || pathname === `${home}/`;
  const navLinks = NAV_KEYS.map((key) => ({
    key,
    href: anchorHref(locale, dict, key, isHome),
    label: dict.nav[key],
  }));
  const ctaHref = startHref(locale, dict);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menu = mounted
    ? createPortal(
        <div className="lg:hidden" aria-hidden={!open}>
          <div
            className={`fixed inset-0 z-[80] bg-forest/45 transition-opacity duration-300 ${
              open
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.mobileMenu}
            className={`fixed inset-y-0 right-0 z-[90] flex h-[100dvh] w-[75vw] max-w-sm flex-col bg-cream transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-[var(--site-header-height)] shrink-0 items-center justify-between border-b border-border/60 px-5">
              <BrandLogo size="sm" label={dict.brand.homeAria} />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-forest"
                aria-label={dict.nav.closeMenu}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
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
              className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-8"
              aria-label={dict.nav.mobileNav}
            >
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="rounded-md px-2 py-3 font-display text-2xl font-semibold text-forest transition-colors hover:text-terracotta"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="shrink-0 border-t border-border/60 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex">
                <LanguageToggle
                  locale={locale}
                  label={dict.languageToggle.label}
                  nlLabel={dict.languageToggle.nl}
                  enLabel={dict.languageToggle.en}
                />
              </div>
              <Link
                href={ctaHref}
                className="inline-flex w-full items-center justify-center rounded-md bg-terracotta px-4 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
                onClick={() => setOpen(false)}
              >
                {dict.nav.cta}
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 h-[var(--site-header-height)] border-b border-border/60 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <BrandLogo size="md" label={dict.brand.homeAria} />

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label={dict.nav.mainNav}
          >
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="text-sm font-medium text-forest-muted transition-colors hover:text-terracotta"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle
              locale={locale}
              label={dict.languageToggle.label}
              nlLabel={dict.languageToggle.nl}
              enLabel={dict.languageToggle.en}
            />

            <Link
              href={ctaHref}
              className="hidden rounded-md bg-terracotta px-4 py-2.5 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-terracotta-hover sm:inline-flex"
            >
              {dict.nav.cta}
            </Link>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-forest lg:hidden"
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
      </header>
      {menu}
    </>
  );
}
