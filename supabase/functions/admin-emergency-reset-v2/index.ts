
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const email = body.email || "admin@digital-footprint.uk";
    const password = body.password || "DfAdmin#2026";

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("admin_profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "No admin account found with this email." }), { status: 404, headers: corsHeaders });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password, email_confirm: true }
    );

    if (updateError) {
      return new Response(JSON.stringify({ error: "Password update failed: " + updateError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, message: "Password reset successfully." }), { headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
