import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getStripe,
  isOrderPackageId,
  type OrderPackageId,
} from "@/lib/stripe";

export type PaidAccess = {
  checkoutSessionId: string;
  paymentIntentId: string | null;
  email: string;
  packageChoice: OrderPackageId;
  formReferenceId: string;
  amountTotal: number | null;
  currency: string | null;
  paidAt: string;
};

export type PaidAccessResult =
  | { ok: true; access: PaidAccess }
  | { ok: false; reason: "missing" | "unpaid" | "used" | "invalid" | "error" };

/**
 * Validates a Stripe Checkout Session for gated briefing access.
 * Payment is verified with Stripe; unused-session check uses the shared
 * orders table (CMS ingest creates the order — lead site does not insert it).
 */
export async function resolvePaidAccess(
  checkoutSessionId: string | undefined | null,
): Promise<PaidAccessResult> {
  const sessionId = checkoutSessionId?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return { ok: false, reason: "missing" };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { ok: false, reason: "unpaid" };
    }

    const packageChoice = session.metadata?.package;
    if (!packageChoice || !isOrderPackageId(packageChoice)) {
      return { ok: false, reason: "invalid" };
    }

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.email ||
      "";
    if (!email) {
      return { ok: false, reason: "invalid" };
    }

    const formReferenceId =
      session.metadata?.form_reference_id?.trim() ||
      `JW-PAY-${sessionId.slice(-8).toUpperCase()}`;

    const supabase = getSupabaseAdmin();
    const { data: existing, error } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("paid access lookup error:", error);
      return { ok: false, reason: "error" };
    }
    if (existing) {
      return { ok: false, reason: "used" };
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    return {
      ok: true,
      access: {
        checkoutSessionId: sessionId,
        paymentIntentId,
        email,
        packageChoice,
        formReferenceId,
        amountTotal: session.amount_total,
        currency: session.currency,
        paidAt: new Date(
          (session.created || Math.floor(Date.now() / 1000)) * 1000,
        ).toISOString(),
      },
    };
  } catch (err) {
    console.error("resolvePaidAccess failed:", err);
    return { ok: false, reason: "error" };
  }
}
