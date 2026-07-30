import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-cream-dark/60">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 0% 100%, rgba(192,127,99,0.1), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-md">
            <BrandLogo size="lg" label="jewebsiteonline.be" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Professionele websites van 1 of 3 pagina&apos;s voor KMO&apos;s in
              België en Nederland. Gratis preview binnen 48 uur, live binnen een
              dag na goedkeuring. SEO-vriendelijk en transparant geprijsd.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:info@jewebsiteonline.be"
                aria-label="Stuur een e-mail"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-cream text-forest transition-colors hover:border-terracotta/50 hover:text-terracotta"
              >
                <MailIcon />
              </a>
              <a
                href="https://www.instagram.com/jewebsiteonline/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Volg ons op Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-cream text-forest transition-colors hover:border-terracotta/50 hover:text-terracotta"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                Navigatie
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {[
                  { href: "/#hoe-het-werkt", label: "Hoe het werkt" },
                  { href: "/#voorbeelden", label: "Voorbeelden" },
                  { href: "/#prijzen", label: "Prijzen" },
                  { href: "/#reviews", label: "Reviews" },
                  { href: "/start-nu", label: "Start nu" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-forest-muted transition-colors hover:text-terracotta"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                Juridisch
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-forest-muted transition-colors hover:text-terracotta"
                  >
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:info@jewebsiteonline.be"
                    className="text-forest-muted transition-colors hover:text-terracotta"
                  >
                    info@jewebsiteonline.be
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border/70">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted md:px-8">
          © {year} jewebsiteonline.be. Alle rechten voorbehouden.
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
