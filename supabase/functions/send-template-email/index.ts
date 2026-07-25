
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TemplateRequest {
  template_id: string;
  to: string;
  variables?: Record<string, string>;
  from?: string;
  cc?: string;
  bcc?: string;
  reply_to?: string;
  subject_prefix?: string;
  subject_override?: string;
  preview_text_override?: string;
}

function renderTemplate(html: string, vars: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{{ ${key} }}`, value);
  }
  return result;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  try {
    const body: TemplateRequest = await req.json();

    if (!body.template_id || !body.to) {
      return new Response(JSON.stringify({ success: false, error: "template_id and to are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: template, error: templateError } = await supabaseClient
      .from("email_templates")
      .select("*")
      .eq("id", body.template_id)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({ success: false, error: "Template not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vars = body.variables || {};

    let renderedSubject: string;
    if (body.subject_override) {
      renderedSubject = (body.subject_prefix || '') + body.subject_override;
    } else {
      const prefix = body.subject_prefix || '';
      renderedSubject = prefix + renderTemplate(template.subject, vars);
    }

    let renderedHtml = renderTemplate(template.html_content, vars);

    if (body.preview_text_override) {
      const previewSpan = `<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${body.preview_text_override}${'\u00A0'.repeat(100)}</span>`;
      renderedHtml = renderedHtml.replace(/<body[^>]*>/i, `$&${previewSpan}`);
    }

    const payload: Record<string, unknown> = {
      from: body.from || "Digital Footprint <noreply@digital-footprint.uk>",
      to: body.to,
      subject: renderedSubject,
      html: renderedHtml,
    };
    if (body.cc) payload.cc = body.cc;
    if (body.bcc) payload.bcc = body.bcc;
    if (body.reply_to) payload.reply_to = body.reply_to;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: data.message || "Resend API error" }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
