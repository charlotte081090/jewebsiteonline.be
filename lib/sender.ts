const SENDER_API = "https://api.sender.net/v2";

/** Custom fields we sync from a briefing (no image uploads). */
const CUSTOM_FIELDS = [
  { key: "company", title: "Company" },
  { key: "address", title: "Address" },
  { key: "show_phone", title: "Show phone on website" },
  { key: "show_address", title: "Show address on website" },
  { key: "opening_hours", title: "Opening hours" },
  { key: "instagram", title: "Instagram" },
  { key: "facebook", title: "Facebook" },
  { key: "other_social", title: "Other social" },
  { key: "sector", title: "Sector" },
  { key: "business_info", title: "About the business" },
  { key: "package", title: "Package" },
  { key: "pages", title: "Pages" },
  { key: "has_logo", title: "Has logo" },
  { key: "brand_notes", title: "Brand notes" },
  { key: "locale", title: "Briefing language" },
  { key: "order_number", title: "Order number" },
  { key: "privacy_consent", title: "Privacy consent" },
] as const;

export type BriefingSubscriberPayload = {
  email: string;
  contactPerson: string;
  phone: string;
  companyName: string;
  address: string;
  showPhone: string;
  showAddress: string;
  openingHours: string;
  instagram: string;
  facebook: string;
  otherSocial: string;
  sector: string;
  businessInfo: string;
  packageChoice: string;
  selectedPages: string;
  hasLogo: string;
  brandNotes: string;
  locale: string;
  orderNumber?: string;
  privacyConsent: string;
};

type SenderField = {
  title?: string;
  /** Live API returns `name` like `{{company}}` (docs still mention field_name). */
  name?: string;
  field_name?: string;
  default?: boolean;
};

let fieldMapCache: Record<string, string> | null = null;

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function yesNoLabel(value: string) {
  return value === "ja" ? "Yes" : value === "nee" ? "No" : value;
}

/** Prefer E.164; Belgian mobile/landline without country code gets +32. */
export function normalizePhoneForSender(phone: string): string | undefined {
  const cleaned = phone.replace(/[\s().-]/g, "");
  if (!cleaned) return undefined;
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (/^0\d{8,9}$/.test(cleaned)) return `+32${cleaned.slice(1)}`;
  if (/^\d{9,15}$/.test(cleaned)) return `+${cleaned}`;
  return undefined;
}

function splitName(fullName: string): { firstname: string; lastname?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: "—" };
  if (parts.length === 1) return { firstname: parts[0]! };
  return {
    firstname: parts[0]!,
    lastname: parts.slice(1).join(" "),
  };
}

async function listFields(token: string): Promise<SenderField[]> {
  const res = await fetch(`${SENDER_API}/fields?limit=100`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Sender fields list failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: SenderField | SenderField[];
  };
  if (Array.isArray(json.data)) return json.data;
  if (json.data) return [json.data];
  return [];
}

async function createField(
  token: string,
  title: string,
): Promise<string | null> {
  const res = await fetch(`${SENDER_API}/fields`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title, type: "text" }),
  });
  if (!res.ok) {
    console.error("Sender create field failed:", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as {
    data?: { name?: string; field_name?: string };
  };
  return json.data?.name ?? json.data?.field_name ?? null;
}

/**
 * Ensures custom fields exist and returns a map of our keys → Sender {$field_name}.
 */
async function ensureFieldMap(token: string): Promise<Record<string, string>> {
  if (fieldMapCache) return fieldMapCache;

  const existing = await listFields(token);
  const byTitle = new Map(
    existing
      .filter((f) => f.title && (f.name || f.field_name))
      .map((f) => [f.title!.toLowerCase(), (f.name || f.field_name)!]),
  );

  const map: Record<string, string> = {};

  for (const field of CUSTOM_FIELDS) {
    const known = byTitle.get(field.title.toLowerCase());
    if (known) {
      map[field.key] = known;
      continue;
    }
    const created = await createField(token, field.title);
    if (created) {
      map[field.key] = created;
      byTitle.set(field.title.toLowerCase(), created);
    }
  }

  fieldMapCache = map;
  return map;
}

function buildCustomFieldValues(
  fieldMap: Record<string, string>,
  payload: BriefingSubscriberPayload,
): Record<string, string> {
  const values: Record<string, string> = {
    company: payload.companyName,
    address: payload.address || "—",
    show_phone: yesNoLabel(payload.showPhone),
    show_address: yesNoLabel(payload.showAddress),
    opening_hours: payload.openingHours,
    instagram: payload.instagram || "—",
    facebook: payload.facebook || "—",
    other_social: payload.otherSocial || "—",
    sector: payload.sector,
    business_info: payload.businessInfo,
    package: payload.packageChoice,
    pages: payload.selectedPages || "—",
    has_logo: yesNoLabel(payload.hasLogo),
    brand_notes: payload.brandNotes || "—",
    locale: payload.locale === "en" ? "English" : "Dutch",
    order_number: payload.orderNumber || "—",
    privacy_consent: yesNoLabel(payload.privacyConsent),
  };

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const fieldName = fieldMap[key];
    if (fieldName && value) out[fieldName] = value.slice(0, 5000);
  }
  return out;
}

/**
 * Upserts a briefing contact into Sender (group + custom fields).
 * Failures are logged; callers should not block the form on this.
 */
export async function syncBriefingToSender(
  payload: BriefingSubscriberPayload,
): Promise<{ ok: boolean; detail?: string }> {
  const token = process.env.SENDER_API_TOKEN;
  const groupId = process.env.SENDER_GROUP_ID;

  if (!token || !groupId) {
    return { ok: false, detail: "missing_env" };
  }

  try {
    const fieldMap = await ensureFieldMap(token);
    const { firstname, lastname } = splitName(payload.contactPerson);
    const phone = normalizePhoneForSender(payload.phone);

    const body: Record<string, unknown> = {
      email: payload.email,
      firstname,
      groups: [groupId],
      fields: buildCustomFieldValues(fieldMap, payload),
      trigger_automation: false,
    };
    if (lastname) body.lastname = lastname;
    if (phone) body.phone = phone;

    const createRes = await fetch(`${SENDER_API}/subscribers`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });

    if (createRes.ok) {
      return { ok: true };
    }

    const createText = await createRes.text();

    // Already exists → update + ensure group membership
    if (createRes.status === 422 || createRes.status === 409) {
      const encoded = encodeURIComponent(payload.email);
      const updateRes = await fetch(`${SENDER_API}/subscribers/${encoded}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          firstname,
          ...(lastname ? { lastname } : {}),
          ...(phone ? { phone } : {}),
          groups: [groupId],
          fields: buildCustomFieldValues(fieldMap, payload),
          trigger_automation: false,
        }),
      });

      if (updateRes.ok) return { ok: true };

      const updateText = await updateRes.text();
      console.error("Sender update failed:", updateRes.status, updateText);
      return { ok: false, detail: `update_${updateRes.status}` };
    }

    console.error("Sender create failed:", createRes.status, createText);
    return { ok: false, detail: `create_${createRes.status}` };
  } catch (err) {
    console.error("Sender sync exception:", err);
    return { ok: false, detail: "exception" };
  }
}
