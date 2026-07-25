
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM_DOMAIN = Deno.env.get("RESEND_FROM_DOMAIN") || "digital-footprint.uk";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: corsHeaders });
    }

    if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing Supabase credentials" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const goTrueResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/generate_link`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          type: "recovery",
          email,
          options: {
            redirect_to: "https://digital-footprint.uk/admin/reset-password",
          },
        }),
      }
    );

    const goTrueData = await goTrueResponse.json();

    if (!goTrueResponse.ok) {
      const errMsg = goTrueData?.msg || goTrueData?.message || goTrueData?.error || "unknown error";
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link: " + errMsg }),
        { status: 500, headers: corsHeaders }
      );
    }

    const resetLink = goTrueData?.properties?.action_link;
    if (!resetLink) {
      return new Response(
        JSON.stringify({ error: "No action link returned from Supabase" }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing Resend API key" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const resendPayload = {
      from: `Digital Footprint Admin <noreply@${RESEND_FROM_DOMAIN}>`,
      to: email,
      subject: "Reset Your Admin Password — Digital Footprint",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0F172A; color: #E2E8F0;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 6px 0;">Digital Footprint</h1>
            <p style="font-size: 13px; color: #64748B; margin: 0;">Admin Portal — Password Reset</p>
          </div>
          <div style="background: #1E293B; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 28px 24px; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 20px 0; line-height: 1.6;">
              You requested a password reset for your admin account. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06B6D4, #0891B2); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px;">
                Reset Your Password
              </a>
            </div>
            <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0; line-height: 1.5;">
              This link will expire in 60 minutes. If you didn&apos;t request this, you can safely ignore this email.
            </p>
          </div>
          <p style="font-size: 11px; color: #475569; text-align: center; margin: 0;">
            Digital Footprint &middot; One Contact. One Relationship. One Vision.
          </p>
        </div>
      `,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Resend API error: " + (resendData.message || "unknown") }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Reset email sent via Resend", email }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
