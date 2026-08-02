import Stripe from "npm:stripe@22.1.1";
import { createClient } from "npm:@supabase/supabase-js@2.106.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://digital-footprint.uk";

const ALLOWED_HOSTS = new Set(["digital-footprint.uk", "www.digital-footprint.uk", "localhost"]);

interface PlanDef {
  key: string;
  name: string;
  priceId: string;
  amountMinor: number;
}

const PLANS: Record<string, PlanDef> = {
  ai_workflow_monthly: { key: "ai_workflow_monthly", name: "Workflow Starter Monthly", priceId: "price_1TxYdKEvwddKcZGPFPpg1mAW", amountMinor: 14900 },
  ai_business_monthly: { key: "ai_business_monthly", name: "Business Automation Monthly", priceId: "price_1TxYdLEvwddKcZGPdwANCbTk", amountMinor: 29900 },
  ai_workforce_monthly: { key: "ai_workforce_monthly", name: "AI Workforce Monthly", priceId: "price_1TxYdLEvwddKcZGPOkJdw2H9", amountMinor: 59900 },
  care_essential: { key: "care_essential", name: "Essential Care", priceId: "price_1TxYdLEvwddKcZGPOCvVQKFz", amountMinor: 7900 },
  care_business: { key: "care_business", name: "Business Care", priceId: "price_1TxYdMEvwddKcZGPzjgqNahD", amountMinor: 14900 },
  care_priority: { key: "care_priority", name: "Priority Care", priceId: "price_1TxYdMEvwddKcZGPjXmrSWF1", amountMinor: 29900 },
  monthly_seo: { key: "monthly_seo", name: "Monthly SEO", priceId: "price_1TxYdOEvwddKcZGPUdnRZuCl", amountMinor: 39500 },
};

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".readdy.ai");
}

function cors(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  let allowedOrigin = SITE_URL;
  try {
    const url = new URL(origin);
    if (isAllowedHost(url.hostname)) allowedOrigin = origin;
  } catch {
    // Non-browser request.
  }
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "POST, OPTIONS",
    "cache-control": "no-store",
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: cors(req) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
    return json(req, { error: "Subscription service is not configured" }, 503);
  }

  const authorization = req.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json(req, { error: "Authentication required" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json(req, { error: "Invalid session" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON body" }, 400);
  }

  const planKey = String(body.planKey ?? body.plan_key ?? "").trim().toLowerCase();
  const plan = PLANS[planKey];
  if (!plan) return json(req, { error: "Invalid subscription plan" }, 400);

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id, email, contact_name, company_name, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (clientError || !client) {
    return json(req, { error: "A client account is required to start a subscription" }, 403);
  }

  const { data: existing, error: existingError } = await admin
    .from("subscriptions")
    .select("id, stripe_subscription_id, status")
    .eq("client_id", client.id)
    .eq("name", plan.name)
    .in("status", ["active", "trialing", "past_due", "unpaid", "incomplete"])
    .limit(1)
    .maybeSingle();
  if (existingError) return json(req, { error: "Unable to check current subscriptions" }, 500);
  if (existing?.stripe_subscription_id) {
    return json(req, { error: "This subscription is already active or awaiting payment" }, 409);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  let customerId = client.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: client.email || user.email || undefined,
      name: client.company_name || client.contact_name || undefined,
      metadata: { client_id: client.id, user_id: user.id, venture_code: "digital-footprint" },
    }, { idempotencyKey: `dfp-subscription-customer-${client.id}` });
    customerId = customer.id;

    const { error: updateError } = await admin
      .from("clients")
      .update({ stripe_customer_id: customerId })
      .eq("id", client.id)
      .is("stripe_customer_id", null);
    if (updateError) return json(req, { error: "Unable to save the billing customer" }, 500);
  }

  const metadata = {
    type: "dfp_subscription",
    plan_key: plan.key,
    client_id: client.id,
    user_id: user.id,
    venture_code: "digital-footprint",
  };
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    success_url: `${SITE_URL}/portal/billing?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/portal/billing?subscription=cancelled`,
    allow_promotion_codes: false,
  }, {
    idempotencyKey: `dfp-subscription-checkout-${client.id}-${plan.key}-${Math.floor(Date.now() / 900000)}`,
  });

  if (!session.url) return json(req, { error: "Stripe did not return a checkout URL" }, 502);
  return json(req, { url: session.url, sessionId: session.id, planKey: plan.key });
});
