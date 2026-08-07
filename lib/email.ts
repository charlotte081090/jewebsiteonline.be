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

type ContactInquiryInput = {
  from: string;
  to: string;
  replyTo: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  locale: Locale;
  ip: string;
};

/** Staff notification for the sticky contact widget. */
export async function sendContactInquiry(
  resend: Resend,
  input: ContactInquiryInput,
): Promise<{ ok: boolean; error?: unknown }> {
  const subject = `Contact: ${input.topic} - ${input.name}`;

  const text = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Topic: ${input.topic}`,
    `Locale: ${input.locale}`,
    `IP: ${input.ip}`,
    "",
    input.message,
  ].join("\n");

  const html = `
    <h2>New contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Topic:</strong> ${escapeHtml(input.topic)}</p>
    <p><strong>Locale:</strong> ${escapeHtml(input.locale)}</p>
    <p><strong>IP:</strong> ${escapeHtml(input.ip)}</p>
    <hr />
    <p style="white-space:pre-wrap;">${escapeHtml(input.message)}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: input.from,
      to: [input.to],
      replyTo: input.replyTo,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
