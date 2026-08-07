"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import {
  anchorHref,
  privacyHref,
  termsHref,
} from "@/lib/i18n/path";

const NAV_KEYS = ["howItWorks", "examples", "pricing", "faq"] as const;

export function Footer() {
  const { locale, dict } = useLocaleContext();
  const year = new Date().getFullYear();

  const navLinks = [
    ...NAV_KEYS.map((key) => ({
      key,
      href: anchorHref(locale, dict, key),
      label: dict.nav[key],
    })),
    {
      key: "startNow",
      href: anchorHref(locale, dict, "pricing"),
      label: dict.nav.startNow,
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-cream-dark">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 0% 100%, rgba(255,46,0,0.08), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-md">
            <BrandLogo size="lg" tone="dark" label={dict.brand.homeAria} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {dict.footer.blurb}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:info@jewebsiteonline.com"
                aria-label={dict.footer.emailAria}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-cream text-forest transition-colors hover:border-terracotta/50 hover:text-terracotta"
              >
                <MailIcon />
              </a>
              <a
                href="https://www.instagram.com/jewebsiteonline/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.footer.instagramAria}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-cream text-forest transition-colors hover:border-terracotta/50 hover:text-terracotta"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                {dict.footer.navigation}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {navLinks.map((link) => (
                  <li key={link.key}>
                    <SectionLink
                      href={link.href}
                      className="text-forest-muted transition-colors hover:text-terracotta"
                    >
                      {link.label}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                {dict.footer.legal}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href={privacyHref(locale, dict)}
                    className="text-forest-muted transition-colors hover:text-terracotta"
                  >
                    {dict.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href={termsHref(locale, dict)}
                    className="text-forest-muted transition-colors hover:text-terracotta"
                  >
                    {dict.footer.terms}
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:info@jewebsiteonline.com"
                    className="text-forest-muted transition-colors hover:text-terracotta"
                  >
                    info@jewebsiteonline.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border/70">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted md:px-8">
          {dict.footer.rights.replace("{year}", String(year))}
        </p>
      </div>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
