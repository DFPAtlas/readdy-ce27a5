
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_DOMAIN = Deno.env.get("RESEND_FROM_DOMAIN") ?? "digital-footprint.uk";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const resend = new Resend(RESEND_API_KEY);

interface GuidanceResult {
  destinations: string[];
  hasAccount: boolean;
}

async function resolveDestinationsByEmail(email: string): Promise<GuidanceResult> {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const destinations: string[] = [];

  const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
  const matchedUser = authUser?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!matchedUser) return { destinations, hasAccount: false };
  const userId = matchedUser.id;

  const checks = await Promise.all([
    supabaseAdmin.from("admin_profiles").select("id").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("staff_profiles").select("id").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("portal_access").select("id, access_role").eq("user_id", userId).eq("is_revoked", false).maybeSingle(),
    supabaseAdmin.from("uat_testers").select("id").eq("user_id", userId).maybeSingle(),
  ]);

  if (checks[0].data) destinations.push("admin");
  if (checks[1].data) destinations.push("staff");
  if (checks[2].data) destinations.push("client");
  if (checks[3].data) destinations.push("uat");

  return { destinations, hasAccount: destinations.length > 0 };
}

function buildGuidanceEmail(destinations: string[], email: string): string {
  const lines: string[] = [];
  lines.push("Hi,");
  lines.push("");
  lines.push("You requested sign-in guidance for your Digital Footprint account.");
  lines.push("");

  if (destinations.length === 0) {
    lines.push("We looked up the email address you provided and could not locate an active Digital Footprint portal account. If you believe you should have access, please contact your Digital Footprint account manager or reply to this email.");
  } else {
    lines.push("Based on the email you provided, you may have access to the following Digital Footprint services:");
    lines.push("");

    for (const dest of destinations) {
      switch (dest) {
        case "admin":
          lines.push("• Admin Portal — https://digital-footprint.uk/admin/login");
          break;
        case "staff":
          lines.push("• Staff Gateway — https://digital-footprint.uk/staff/login");
          break;
        case "client":
          lines.push("• Client Portal — https://digital-footprint.uk/portal/login");
          break;
        case "uat":
          lines.push("• UAT TestLab — https://digital-footprint.uk/uat/jobs");
          break;
      }
    }

    lines.push("");
    lines.push("Please use the link(s) above to sign in. If you have any questions, reply to this email.");
  }

  lines.push("");
  lines.push("— Digital Footprint");
  lines.push("https://digital-footprint.uk");

  return lines.join("\n");
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "If an account or invitation is associated with that address, we will send the appropriate sign-in guidance." }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ message: "If an account or invitation is associated with that address, we will send the appropriate sign-in guidance." }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { destinations, hasAccount } = await resolveDestinationsByEmail(email);
    const emailBody = buildGuidanceEmail(hasAccount ? destinations : [], email);

    await resend.emails.send({
      from: `Digital Footprint <noreply@${RESEND_FROM_DOMAIN}>`,
      to: email,
      subject: "Your Digital Footprint sign-in guidance",
      text: emailBody,
    });
  } catch {
    // silently fail — never reveal to the caller
  }

  return new Response(
    JSON.stringify({ message: "If an account or invitation is associated with that address, we will send the appropriate sign-in guidance." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
