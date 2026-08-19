import Stripe from "npm:stripe@22.1.1";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://digital-footprint.uk";

const ALLOWED_HOSTS = new Set([
  "digital-footprint.uk",
  "www.digital-footprint.uk",
  "localhost",
]);

const LOOKUP_KEY = "starter_plan_monthly";
const PLAN_NAME = "Starter Plan";
const PLAN_DESCRIPTION = "Ongoing website management and support subscription.";
const PLAN_PRICE_MINOR = 2000;
const CURRENCY = "gbp";
const INTERVAL = "month";

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
    // Non-browser requests do not need a reflected Origin.
  }
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "cache-control": "no-store",
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: cors(req) });
}

function redirectUrl(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value) return fallback;
  try {
    const url = new URL(value);
    const validProtocol = url.protocol === "https:" ||
      (url.protocol === "http:" && url.hostname === "localhost");
    return isAllowedHost(url.hostname) && validProtocol ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

async function resolvePrice(stripe: Stripe): Promise<string> {
  const existing = await stripe.prices.list({
    lookup_keys: [LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data.length > 0) return existing.data[0].id;

  const product = await stripe.products.create({
    name: PLAN_NAME,
    description: PLAN_DESCRIPTION,
    metadata: { venture_code: "digital-footprint" },
  });

  const price = await stripe.prices.create({
    product: product.id,
    lookup_key: LOOKUP_KEY,
    currency: CURRENCY,
    unit_amount: PLAN_PRICE_MINOR,
    recurring: { interval: INTERVAL },
    metadata: { venture_code: "digital-footprint" },
  });

  return price.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  if (!STRIPE_SECRET_KEY) return json(req, { error: "Payment service is not configured" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON body" }, 400);
  }

  const lookupKey = String(body.lookupKey ?? body.lookup_key ?? "").trim();
  if (lookupKey && lookupKey !== LOOKUP_KEY) {
    return json(req, { error: "Invalid plan selected" }, 400);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let priceId: string;
  try {
    priceId = await resolvePrice(stripe);
  } catch (error) {
    console.error("Failed to resolve plan price", error instanceof Error ? error.message : error);
    return json(req, { error: "Unable to prepare subscription checkout" }, 502);
  }

  const successUrl = redirectUrl(
    body.successUrl ?? body.success_url,
    `${SITE_URL}/checkout/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
  );
  const cancelUrl = redirectUrl(
    body.cancelUrl ?? body.cancel_url,
    `${SITE_URL}/checkout/cancelled`,
  );

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { venture_code: "digital-footprint", plan: LOOKUP_KEY },
      },
      metadata: {
        venture_code: "digital-footprint",
        plan: LOOKUP_KEY,
        type: "subscription_checkout",
      },
      custom_text: {
        submit: {
          message: "Your Starter Plan will renew monthly and can be cancelled at any time.",
        },
      },
    });
  } catch (error) {
    console.error(
      "Failed to create subscription checkout session",
      error instanceof Error ? error.message : error,
    );
    return json(req, { error: "Unable to create subscription session" }, 502);
  }

  if (!session.url) return json(req, { error: "Stripe did not return a checkout URL" }, 502);

  return json(req, { url: session.url, sessionId: session.id });
});
