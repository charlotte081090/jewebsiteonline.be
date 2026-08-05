import { Resend } from "resend";
import type { Locale } from "@/lib/i18n/config";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getEmailFrom() {
  return (
    process.env.CONTACT_FROM ??
    "jewebsiteonline.be <onboarding@resend.dev>"
  );
}

export function getStaffInbox() {
  return process.env.CONTACT_TO ?? "info@jewebsiteonline.com";
}

type ClientConfirmationInput = {
  to: string;
  contactPerson: string;
  companyName: string;
  orderNumber: string;
  locale: Locale;
};

/** Confirmation email to the customer after a successful briefing submit. */
export async function sendClientBriefingConfirmation(
  resend: Resend,
  input: ClientConfirmationInput,
): Promise<{ ok: boolean; error?: unknown }> {
  const from = getEmailFrom();
  const name = input.contactPerson.trim() || input.companyName;
  const order = input.orderNumber;

  const copy =
    input.locale === "en"
      ? {
          subject: `We received your briefing — ${order}`,
          heading: `Thanks, ${escapeHtml(name)}`,
          body: "We've received your briefing and will get started shortly. Keep this reference number handy if you contact us:",
          footer: "Questions? Reply to this email or write to info@jewebsiteonline.com.",
          text: [
            `Thanks, ${name}`,
            "",
            "We've received your briefing and will get started shortly.",
            `Reference: ${order}`,
            "",
            "Questions? Reply to this email or write to info@jewebsiteonline.com.",
          ].join("\n"),
        }
      : {
          subject: `We hebben uw briefing ontvangen — ${order}`,
          heading: `Bedankt, ${escapeHtml(name)}`,
          body: "We hebben uw briefing ontvangen en gaan ermee aan de slag. Bewaar dit referentienummer als u ons contacteert:",
          footer:
            "Vragen? Beantwoord deze e-mail of mail naar info@jewebsiteonline.com.",
          text: [
            `Bedankt, ${name}`,
            "",
            "We hebben uw briefing ontvangen en gaan ermee aan de slag.",
            `Referentie: ${order}`,
            "",
            "Vragen? Beantwoord deze e-mail of mail naar info@jewebsiteonline.com.",
          ].join("\n"),
        };

  try {
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject: copy.subject,
      text: copy.text,
      html: `
        <h2>${copy.heading}</h2>
        <p>${copy.body}</p>
        <p style="font-size:18px;font-weight:600;letter-spacing:0.02em;">${escapeHtml(order)}</p>
        <p>${copy.footer}</p>
      `,
    });
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
