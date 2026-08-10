"use client";

import Image from "next/image";
import { LanguageToggle } from "@/components/language-toggle";
import { SectionLink } from "@/components/section-link";
import { useLocaleContext } from "@/components/locale-provider";
import {
  MOBILE_NAV_KEYS,
  useMobileNav,
} from "@/components/mobile-nav-context";
import { anchorHref } from "@/lib/i18n/path";

type MobileMenuFaceProps = {
  isHome: boolean;
};

export function MobileMenuFace({ isHome }: MobileMenuFaceProps) {
  const { locale, dict } = useLocaleContext();
  const { setOpen, activeKey } = useMobileNav();

  const navLinks = MOBILE_NAV_KEYS.map((key) => ({
    key,
    href: anchorHref(locale, dict, key, isHome),
    label: dict.nav[key],
  }));
  const ctaHref = anchorHref(locale, dict, "pricing", isHome);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={dict.nav.mobileMenu}
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-cover-workspace.jpg"
          alt=""
          fill
          quality={72}
          sizes="100vw"
          className="object-cover object-[center_40%]"
          aria-hidden
        />
      </div>

      <div
        className="absolute inset-0 z-[1]"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.48) 40%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* Glass wash — same language as the landing header pill */}
      <div
        className="absolute inset-0 z-[2] border border-cream/20 bg-cream/12 backdrop-blur-md"
        aria-hidden
      />

      <nav
        className="relative z-10 flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 pb-4 pt-[calc(var(--site-header-offset)+0.75rem)] sm:px-8"
        aria-label={dict.nav.mobileNav}
      >
        {navLinks.map((link) => {
          const active = activeKey === link.key;
          return (
            <SectionLink
              key={link.key}
              href={link.href}
              className={
                active
                  ? "rounded-2xl px-2 py-3.5 font-display text-3xl font-bold text-terracotta transition-colors hover:bg-cream/10 sm:text-4xl"
                  : "rounded-2xl px-2 py-3.5 font-display text-3xl font-bold text-cream transition-colors hover:bg-cream/10 hover:text-terracotta-soft sm:text-4xl"
              }
              aria-current={active ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </SectionLink>
          );
        })}
      </nav>

      <div className="relative z-10 flex items-center gap-3 border-t border-cream/20 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
        <LanguageToggle
          locale={locale}
          label={dict.languageToggle.label}
          nlLabel={dict.languageToggle.nl}
          enLabel={dict.languageToggle.en}
          tone="light"
          compact
        />
        <SectionLink
          href={ctaHref}
          className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full bg-terracotta px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          onClick={() => setOpen(false)}
        >
          {dict.nav.cta}
        </SectionLink>
      </div>
    </div>
  );
}
