"use client";

import Link from "next/link";
import { useEffect, useId, useState, useTransition, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { submitContactInquiry } from "@/app/actions/inquiry";
import { useLocaleContext } from "@/components/locale-provider";
import { privacyHref } from "@/lib/i18n/path";
import type { Locale } from "@/lib/i18n/config";

const fieldClass =
  "w-full rounded-xl border border-border/70 bg-cream-dark/40 px-3.5 py-3 text-sm text-forest outline-none transition-colors placeholder:text-muted/65 focus:border-terracotta/45 focus:bg-cream";

export function ContactWidget() {
  const { locale, dict } = useLocaleContext();
  const t = dict.contactWidget;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reachedGuide, setReachedGuide] = useState(false);
  const titleId = useId();
  const guideSectionId = dict.routes.anchors.faq;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function updateVisibility() {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (!isMobile) return;

      const section = document.getElementById(guideSectionId);
      if (!section) {
        setReachedGuide(false);
        return;
      }

      setReachedGuide(
        section.getBoundingClientRect().top <= window.innerHeight * 0.72,
      );
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [guideSectionId]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer =
    mounted && open
      ? createPortal(
          <ContactDrawer
            titleId={titleId}
            locale={locale}
            privacyUrl={privacyHref(locale, dict)}
            t={t}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/2 z-[45] h-12 w-12 -translate-y-1/2 items-center justify-center rounded-l-xl bg-terracotta text-cream shadow-[0_8px_24px_rgba(27,48,34,0.22)] transition-colors hover:bg-terracotta-hover md:flex ${
          reachedGuide ? "flex" : "hidden"
        }`}
        aria-label={t.openAria}
        aria-expanded={open}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {drawer}
    </>
  );
}

function ContactDrawer({
  titleId,
  locale,
  privacyUrl,
  t,
  onClose,
}: {
  titleId: string;
  locale: Locale;
  privacyUrl: string;
  t: ReturnType<typeof useLocaleContext>["dict"]["contactWidget"];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [openedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus("idle");

    if (!consent) {
      setStatus("error");
      setError(t.consentRequired);
      return;
    }

    const formData = new FormData();
    formData.set("locale", locale);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("topic", topic);
    formData.set("message", message);
    formData.set("consent", locale === "en" ? "yes" : "ja");
    formData.set("website", honeypot);
    formData.set("openedAt", String(openedAt));

    startTransition(async () => {
      const result = await submitContactInquiry(formData);
      if (!result.ok) {
        setStatus("error");
        setError(
          result.code === "rate_limit"
            ? t.rateLimit
            : result.code === "consent"
              ? t.consentRequired
              : result.error || t.error,
        );
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setTopic("");
      setMessage("");
      setConsent(false);
    });
  }

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-forest/45 backdrop-blur-[2px]"
        aria-label={t.closeAria}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-lg flex-col border-l border-border/70 bg-cream shadow-[-24px_0_60px_rgba(27,48,34,0.18)] animate-[drawer-in_320ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <h3
              id={titleId}
              className="font-display text-2xl font-bold tracking-tight text-forest"
            >
              {t.title}
            </h3>
            {status !== "success" ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.intro}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-forest transition-colors hover:border-terracotta/40 hover:text-terracotta"
            aria-label={t.closeAria}
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

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {status === "success" ? (
            <div className="flex h-full min-h-[18rem] flex-col items-center justify-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-cream"
                aria-hidden
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h4 className="mt-5 font-display text-2xl font-bold tracking-tight text-forest">
                {t.successTitle}
              </h4>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
                {t.successBody}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover"
              >
                {t.successClose}
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-forest">
                  {t.nameLabel}
                </span>
                <input
                  required
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  maxLength={120}
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-forest">
                  {t.emailLabel}
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  maxLength={160}
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-forest">
                  {t.topicLabel}
                </span>
                <select
                  required
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22 fill=%22none%22%3E%3Cpath d=%22M2.5 4.5L6 8l3.5-3.5%22 stroke=%22%231b3022%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-10`}
                >
                  <option value="" disabled>
                    {t.topicPlaceholder}
                  </option>
                  {t.topics.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-forest">
                  {t.messageLabel}
                </span>
                <textarea
                  required
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={5}
                  maxLength={4000}
                  className={`${fieldClass} min-h-[8.5rem] resize-y`}
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-cream-dark/35 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta"
                />
                <span className="text-sm leading-relaxed text-forest">
                  {t.consentBefore}
                  <Link
                    href={privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-terracotta underline-offset-2 hover:underline"
                  >
                    {t.consentPrivacy}
                  </Link>
                  {t.consentAfter}
                </span>
              </label>

              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              />

              {error ? (
                <p className="text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-terracotta px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-hover disabled:opacity-60"
              >
                {isPending ? t.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
