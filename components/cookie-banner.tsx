"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

const CONSENT_KEY = "jwo-cookie-consent";

type Consent = "accepted" | "essential";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot(): Consent | "" {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "essential") return stored;
  } catch {
    /* ignore */
  }
  return "";
}

function getServerSnapshot(): Consent | "" {
  return "accepted";
}

export function CookieBanner() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const save = useCallback((value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      const secure =
        typeof window !== "undefined" && window.location.protocol === "https:"
          ? ";Secure"
          : "";
      document.cookie = `${CONSENT_KEY}=${value};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* ignore */
    }
  }, []);

  if (consent) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border border-border bg-cream p-5 shadow-lg md:flex-row md:items-end md:gap-6">
        <div className="flex-1">
          <h2
            id="cookie-title"
            className="font-display text-xl font-semibold text-forest"
          >
            Cookies
          </h2>
          <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-muted">
            Wij gebruiken enkel noodzakelijke cookies om de site te laten werken
            en uw voorkeur te onthouden. Wij gebruiken geen Google Analytics of
            andere volgtools. Meer info in ons{" "}
            <Link
              href="/privacy#cookies"
              className="font-medium text-terracotta underline-offset-2 hover:underline"
            >
              privacybeleid
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-cream-dark"
          >
            Alleen noodzakelijk
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="rounded-md bg-terracotta px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
