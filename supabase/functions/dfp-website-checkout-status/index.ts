import { createClient } from "npm:@supabase/supabase-js@2.106.2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
    // Non-browser
  }
  return {
    "content-type": "application/json",
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "GET, OPTIONS",
    "vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: cors(req) });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(req) });
  }
  if (req.method !== "GET") return json(req, { error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json(req, { error: "Service not configured" }, 503);
  }

  const url = new URL(req.url);
  const ref = url.searchParams.get("ref") || "";

  if (!ref || !/^DFP-\d{4}-[A-HJ-NP-Z2-9]{6}$/.test(ref)) {
    return json(req, { error: "Invalid project reference" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from("dfp_checkout_orders")
    .select(
      "project_reference, package_id, package_name, starting_payment_minor, full_price_minor, remaining_balance_minor, second_milestone_minor, final_milestone_minor, customer_name, customer_email, payment_status"
    )
    .eq("project_reference", ref)
    .maybeSingle();

  if (error || !data) {
    return json(req, { error: "Order not found" }, 404);
  }

  return json(req, data);
});
