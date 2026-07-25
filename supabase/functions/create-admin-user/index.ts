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
    const { email, password, action } = body;

    if (action === "reset-password") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "email and password required" }), { status: 400, headers: corsHeaders });
      }

      if (password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters." }), { status: 400, headers: corsHeaders });
      }

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
        { password }
      );

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ success: true, message: "Password updated successfully." }), { headers: corsHeaders });
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), { status: 400, headers: corsHeaders });
    }

    const { data: existingUser, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), { status: 500, headers: corsHeaders });
    }

    const alreadyExists = existingUser.users.find((u: any) => u.email === email);
    if (alreadyExists) {
      const { data: existingProfile } = await supabaseAdmin
        .from("admin_profiles")
        .select("id")
        .eq("id", alreadyExists.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabaseAdmin.from("admin_profiles").insert({
          id: alreadyExists.id,
          email: email,
          full_name: "James Mitchell",
          role: "admin",
          active: true,
        });
      }

      return new Response(JSON.stringify({
        message: "User already exists. Profile ensured.",
        user_id: alreadyExists.id,
        has_profile: true,
      }), { status: 200, headers: corsHeaders });
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), { status: 500, headers: corsHeaders });
    }

    const { error: profileError } = await supabaseAdmin
      .from("admin_profiles")
      .insert({
        id: newUser.user.id,
        email: email,
        full_name: "James Mitchell",
        role: "admin",
        active: true,
      });

    if (profileError) {
      return new Response(JSON.stringify({ error: "User created but profile link failed: " + profileError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      message: "Admin user created successfully",
      user_id: newUser.user.id,
    }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
