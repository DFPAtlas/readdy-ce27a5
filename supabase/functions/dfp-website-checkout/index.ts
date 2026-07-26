import Stripe from "npm:stripe@22.1.1";
import { createClient } from "npm:@supabase/supabase-js@2.106.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://digital-footprint.uk";

const ALLOWED_HOSTS = new Set([
  "digital-footprint.uk",
  "www.digital-footprint.uk",
  "localhost",
]);

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
    // Non-browser requests
  }
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: cors(req) });
}

interface WebsitePackageDef {
  id: string;
  name: string;
  fullPriceMinor: number;
  depositMinor: number;
  secondMilestoneMinor: number;
  finalMilestoneMinor: number;
  currency: string;
}

const PACKAGE_CATALOGUE: Record<string, WebsitePackageDef> = {
  launch: {
    id: "launch",
    name: "Launch",
    fullPriceMinor: 149500,
    depositMinor: 74750,
    secondMilestoneMinor: 44850,
    finalMilestoneMinor: 29900,
    currency: "gbp",
  },
  growth: {
    id: "growth",
    name: "Growth",
    fullPriceMinor: 299500,
    depositMinor: 149750,
    secondMilestoneMinor: 89850,
    finalMilestoneMinor: 59900,
    currency: "gbp",
  },
  commerce: {
    id: "commerce",
    name: "Commerce",
    fullPriceMinor: 499500,
    depositMinor: 249750,
    secondMilestoneMinor: 149850,
    finalMilestoneMinor: 99900,
    currency: "gbp",
  },
};

function generateProjectReference(): string {
  const year = new Date().getFullYear().toString();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DFP-${year}-${suffix}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);
  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json(req, { error: "Payment service is not configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON body" }, 400);
  }

  const packageId = String(body.packageId ?? body.package_id ?? "").toLowerCase().trim();
  const pkg = PACKAGE_CATALOGUE[packageId];
  if (!pkg) {
    return json(req, { error: "Invalid package selected" }, 400);
  }

  const totalCheck = pkg.depositMinor + pkg.secondMilestoneMinor + pkg.finalMilestoneMinor;
  if (totalCheck !== pkg.fullPriceMinor) {
    console.error("Package milestone total mismatch", { packageId, totalCheck, expected: pkg.fullPriceMinor });
    return json(req, { error: "Checkout configuration error" }, 503);
  }

  const customerName = String(body.customerName ?? body.customer_name ?? "").trim();
  const customerEmail = String(body.customerEmail ?? body.customer_email ?? "").trim();
  const customerPhone = String(body.customerPhone ?? body.customer_phone ?? "").trim();
  const businessName = String(body.businessName ?? body.business_name ?? "").trim();
  const billingAddress = String(body.billingAddress ?? body.billing_address ?? "").trim();
  const billingPostcode = String(body.billingPostcode ?? body.billing_postcode ?? "").trim();
  const billingCountry = String(body.billingCountry ?? body.billing_country ?? "GB").trim();
  const existingWebsite = String(body.existingWebsite ?? body.existing_website ?? "").trim();
  const projectDescription = String(body.projectDescription ?? body.project_description ?? "").trim();
  const preferredContact = String(body.preferredContact ?? body.preferred_contact ?? "email").trim();

  if (!customerName || customerName.length < 2) {
    return json(req, { error: "A valid full name is required" }, 400);
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return json(req, { error: "A valid email address is required" }, 400);
  }
  if (!billingAddress || billingAddress.length < 5) {
    return json(req, { error: "A valid billing address is required" }, 400);
  }
  if (customerEmail.length > 254) {
    return json(req, { error: "Email address is too long" }, 400);
  }
  if (customerName.length > 200) {
    return json(req, { error: "Name is too long" }, 400);
  }
  if (projectDescription.length > 2000) {
    return json(req, { error: "Project description is too long" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const projectReference = generateProjectReference();

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const successUrl = `${SITE_URL}/checkout/success?ref=${encodeURIComponent(projectReference)}`;
  const cancelUrl = `${SITE_URL}/checkout/cancelled?ref=${encodeURIComponent(projectReference)}`;

  const metadata: Record<string, string> = {
    type: "website_starting_payment",
    package_id: pkg.id,
    package_name: pkg.name,
    payment_type: "website_starting_payment",
    payment_percentage: "50",
    full_price_minor: String(pkg.fullPriceMinor),
    remaining_balance_minor: String(pkg.fullPriceMinor - pkg.depositMinor),
    project_reference: projectReference,
    source: "dfp_pricing_page",
    venture_code: "digital-footprint",
  };

  let stripeCustomerId: string | null = null;
  try {
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName,
      phone: customerPhone || undefined,
      address: {
        line1: billingAddress,
        postal_code: billingPostcode || undefined,
        country: billingCountry,
      },
      metadata: {
        project_reference: projectReference,
        venture_code: "digital-footprint",
      },
    }, {
      idempotencyKey: `dfp-customer-${projectReference}`,
    });
    stripeCustomerId = customer.id;
  } catch (e) {
    console.error("Failed to create Stripe customer", e instanceof Error ? e.message : e);
    return json(req, { error: "Unable to create payment session" }, 502);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    client_reference_id: projectReference,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: pkg.depositMinor,
        product_data: {
          name: `DFP ${pkg.name} Website — Starting Payment`,
          description: `50% starting payment for the ${pkg.name} website package. Full package price: \u00A3${(pkg.fullPriceMinor / 100).toFixed(2)}. Remaining balance payable through project milestones.`,
          metadata: {
            package_id: pkg.id,
            venture_code: "digital-footprint",
          },
        },
      },
    }],
    metadata,
    payment_intent_data: { metadata },
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    custom_text: {
      submit: {
        message: `Only the 50% starting payment of \u00A3${(pkg.depositMinor / 100).toFixed(2)} is collected today.`,
      },
    },
  }, {
    idempotencyKey: `website-checkout-${projectReference}`,
  });

  if (!session.url) {
    return json(req, { error: "Stripe did not return a checkout URL" }, 502);
  }

  const { error: insertError } = await admin
    .from("dfp_checkout_orders")
    .insert({
      project_reference: projectReference,
      package_id: pkg.id,
      package_name: pkg.name,
      full_price_minor: pkg.fullPriceMinor,
      starting_payment_minor: pkg.depositMinor,
      remaining_balance_minor: pkg.fullPriceMinor - pkg.depositMinor,
      second_milestone_minor: pkg.secondMilestoneMinor,
      final_milestone_minor: pkg.finalMilestoneMinor,
      currency: "gbp",
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      business_name: businessName || null,
      billing_address: billingAddress,
      billing_postcode: billingPostcode || null,
      billing_country: billingCountry,
      existing_website: existingWebsite || null,
      project_description: projectDescription || null,
      preferred_contact: preferredContact,
      stripe_customer_id: stripeCustomerId,
      stripe_checkout_session_id: session.id,
      payment_status: "pending",
      project_status: "new",
    });

  if (insertError) {
    console.error("Failed to insert checkout order", insertError);
    return json(req, { error: "Unable to record order" }, 500);
  }

  return json(req, {
    url: session.url,
    sessionId: session.id,
    projectReference,
  });
});
