"use server";

import { headers } from "next/headers";
import {
  getEmailFrom,
  getResendClient,
  getStaffInbox,
  sendContactInquiry,
} from "@/lib/email";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { rateLimit } from "@/lib/rate-limit";

export type InquiryResult = { ok: true } | { ok: false; error: string; code?: string };

const MAX_NAME = 120;
const MAX_MESSAGE = 4000;
const MIN_SUBMIT_MS = 2500;

const ALLOWED_TOPICS = new Set([
  "general",
  "light",
  "medium",
  "pro",
  "after-live",
  "other",
]);

const TOPIC_LABELS: Record<string, { nl: string; en: string }> = {
  general: { nl: "Algemene vraag", en: "General question" },
  light: { nl: "Vraag over Light", en: "Question about Light" },
  medium: { nl: "Vraag over Medium", en: "Question about Medium" },
  pro: { nl: "Vraag over Pro", en: "Question about Pro" },
  "after-live": { nl: "Na livegang / support", en: "After go-live / support" },
  other: { nl: "Iets anders", en: "Something else" },
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clientIp(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip") || "unknown";
}

export async function submitContactInquiry(
  formData: FormData,
): Promise<InquiryResult> {
  const localeRaw = String(formData.get("locale") ?? "");
  const locale: Locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { ok: true };
  }

  const openedAt = Number(formData.get("openedAt") ?? 0);
  if (!openedAt || Date.now() - openedAt < MIN_SUBMIT_MS) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const topic = String(formData.get("topic") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !topic || !message) {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Please complete all required fields."
          : "Gelieve alle verplichte velden in te vullen.",
    };
  }

  const consent = String(formData.get("consent") ?? "").trim();
  if (consent !== "ja" && consent !== "yes") {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Please confirm that you agree to the privacy policy."
          : "Bevestig dat u akkoord gaat met het privacybeleid.",
      code: "consent",
    };
  }

  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Your message is too long."
          : "Uw bericht is te lang.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: locale === "en" ? "Invalid email address." : "Ongeldig e-mailadres.",
    };
  }

  if (!ALLOWED_TOPICS.has(topic)) {
    return {
      ok: false,
      error: locale === "en" ? "Invalid topic." : "Ongeldig onderwerp.",
    };
  }

  const headerList = await headers();
  const ip = clientIp(headerList);

  const ipLimit = rateLimit(`inquiry:ip:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!ipLimit.ok) {
    return { ok: false, error: "rate_limit", code: "rate_limit" };
  }

  const emailLimit = rateLimit(`inquiry:email:${email}`, {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!emailLimit.ok) {
    return { ok: false, error: "rate_limit", code: "rate_limit" };
  }

  const resend = getResendClient();
  if (!resend) {
    console.error("RESEND_API_KEY missing — contact inquiry skipped");
    return {
      ok: false,
      error:
        locale === "en"
          ? "Sending failed. Please try again or email info@jewebsiteonline.com."
          : "Versturen mislukt. Probeer opnieuw of mail info@jewebsiteonline.com.",
    };
  }

  const topicLabel =
    TOPIC_LABELS[topic]?.[locale === "en" ? "en" : "nl"] ?? topic;

  const result = await sendContactInquiry(resend, {
    from: getEmailFrom(),
    to: getStaffInbox(),
    replyTo: email,
    name,
    email,
    topic: topicLabel,
    message,
    locale,
    ip,
  });

  if (!result.ok) {
    console.error("Contact inquiry email error:", result.error);
    return {
      ok: false,
      error:
        locale === "en"
          ? "Sending failed. Please try again or email info@jewebsiteonline.com."
          : "Versturen mislukt. Probeer opnieuw of mail info@jewebsiteonline.com.",
    };
  }

  return { ok: true };
}
