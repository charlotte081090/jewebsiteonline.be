export type OrderIngestAnswer = { question: string; answer: string };

export type OrderIngestPayload = {
  stripeCheckoutSessionId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  answers: OrderIngestAnswer[];
  siteLanguage: "nl" | "en";
  formReferenceId?: string;
};

export type OrderIngestResult =
  | { ok: true; orderId?: string; orderNumber?: string; raw: unknown }
  | { ok: false; error: string; status?: number; body?: string };

const DEFAULT_INGEST_URL =
  "https://admin.jewebsiteonline.com/api/orders/ingest";

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

/** Best-effort parse of common CMS order JSON shapes. */
export function extractOrderFields(data: unknown): {
  orderId?: string;
  orderNumber?: string;
} {
  if (!data || typeof data !== "object") return {};

  const root = data as Record<string, unknown>;
  const nested =
    root.order && typeof root.order === "object"
      ? (root.order as Record<string, unknown>)
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  const order = nested ?? root;

  return {
    orderId: pickString(
      order.id,
      order.orderId,
      order.order_id,
      root.id,
      root.orderId,
      root.order_id,
    ),
    orderNumber: pickString(
      order.orderNumber,
      order.order_number,
      order.number,
      root.orderNumber,
      root.order_number,
      root.number,
    ),
  };
}

/**
 * Creates (or returns) the CMS order after a paid briefing.
 * CMS re-verifies Stripe payment; lead site must not treat a local
 * Supabase insert alone as the handoff.
 */
export async function ingestPaidOrder(
  payload: OrderIngestPayload,
): Promise<OrderIngestResult> {
  const secret = process.env.ORDER_INGEST_SECRET?.trim();
  if (!secret) {
    console.error("ORDER_INGEST_SECRET missing");
    return { ok: false, error: "ORDER_INGEST_SECRET missing" };
  }

  const url = process.env.ORDER_INGEST_URL?.trim() || DEFAULT_INGEST_URL;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await response.text();
    let json: unknown = null;
    if (body) {
      try {
        json = JSON.parse(body);
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      console.error("Order ingest failed:", response.status, body);
      return {
        ok: false,
        error: "ingest failed",
        status: response.status,
        body,
      };
    }

    const fields = extractOrderFields(json);
    return { ok: true, ...fields, raw: json ?? body };
  } catch (err) {
    console.error("Order ingest exception:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "ingest exception",
    };
  }
}
