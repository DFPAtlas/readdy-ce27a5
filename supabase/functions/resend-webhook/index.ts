import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVENT_TYPE_MAP: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    id: string;
    object: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
    email_id?: string;
    open_tracking_pixel?: string;
    click_tracking_link?: string;
    link?: { url: string; description?: string };
  };
}

async function verifySignature(req: Request): Promise<boolean> {
  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!webhookSecret) return false;
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  try {
    const body = await req.clone().text();
    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    const encoder = new TextEncoder();
    const key = encoder.encode(webhookSecret.split("_").pop() || webhookSecret);
    const keyData = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatures = svixSignature.split(" ");
    for (const sig of signatures) {
      const parts = sig.split(",");
      const sigValue = parts.find(p => p.startsWith("v1="))?.slice(3);
      if (!sigValue) continue;
      const decoded = base64ToBytes(sigValue);
      const verified = await crypto.subtle.verify("HMAC", keyData, decoded, encoder.encode(signedContent));
      if (verified) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  const maskedLocal = local.length <= 2 ? local : local.slice(0, 2) + "***";
  return `${maskedLocal}@${domain}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  const wasVerified = await verifySignature(req).catch(() => false);
  const body: ResendWebhookPayload = await req.clone().json().catch(() => null as unknown as ResendWebhookPayload);
  if (!body || !body.type || !body.data) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const providerEventId = body.data.id;
    const providerMessageId = body.data.email_id || body.data.id;
    const mappedEventType = EVENT_TYPE_MAP[body.type] || body.type.replace("email.", "");
    const eventTime = body.created_at || body.data.created_at;

    const { data: existing } = await supabase.from("email_delivery_events")
      .select("id")
      .eq("provider_event_id", providerEventId)
      .eq("provider", "resend")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ ok: true, reason: "duplicate" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: existingRecipient } = await supabase.from("email_recipient_messages")
      .select("id, organisation_id, source_type, source_id, current_status")
      .eq("provider_message_id", providerMessageId)
      .maybeSingle();

    const organisationId = existingRecipient?.organisation_id || null;

    const { data: deliveryEvent, error: eventErr } = await supabase.from("email_delivery_events").insert({
      organisation_id: organisationId,
      provider: "resend",
      provider_event_id: providerEventId,
      provider_message_id: providerMessageId,
      campaign_id: existingRecipient?.source_type === "campaign" ? existingRecipient.source_id : null,
      automation_id: existingRecipient?.source_type === "automation" ? existingRecipient.source_id : null,
      recipient_message_id: existingRecipient?.id || null,
      event_type: mappedEventType,
      event_time: eventTime,
      safe_metadata: { raw_type: body.type },
    }).select("id").single();

    if (eventErr) {
      console.error("Failed to insert delivery event:", eventErr);
    }

    if (existingRecipient) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      const newStatus = existingRecipient.current_status;

      if (mappedEventType === "delivered") {
        updates.current_status = newStatus === "opened" || newStatus === "clicked" ? newStatus : "delivered";
        updates.delivered_at = eventTime;
      } else if (mappedEventType === "opened") {
        updates.current_status = newStatus === "clicked" ? newStatus : "opened";
        updates.first_opened_at = existingRecipient.first_opened_at || eventTime;
      } else if (mappedEventType === "clicked") {
        updates.current_status = "clicked";
        updates.first_clicked_at = existingRecipient.first_clicked_at || eventTime;
      } else if (mappedEventType === "bounced") {
        updates.current_status = "bounced";
        updates.bounce_type = body.type === "email.bounced" ? "hard" : "soft";
      } else if (mappedEventType === "complained") {
        updates.current_status = "complained";
        updates.complaint_at = eventTime;
      } else if (mappedEventType === "sent") {
        updates.current_status = newStatus === "delivered" || newStatus === "opened" ? newStatus : "sent";
      }

      await supabase.from("email_recipient_messages").update(updates).eq("id", existingRecipient.id);

      if (mappedEventType === "hard_bounced" && existingRecipient.masked_recipient) {
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(existingRecipient.masked_recipient.toLowerCase()));
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        await supabase.from("email_suppressions").upsert({
          organisation_id: organisationId,
          normalised_email_hash: hashHex,
          masked_email: existingRecipient.masked_recipient,
          reason: "hard_bounce",
          scope: "global",
          source_type: existingRecipient.source_type,
          source_reference: existingRecipient.source_id,
          is_permanent: true,
        }, { onConflict: "normalised_email_hash", ignoreDuplicates: false });
      }

      if (mappedEventType === "complained" && existingRecipient.masked_recipient) {
        const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(existingRecipient.masked_recipient.toLowerCase()));
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        await supabase.from("email_suppressions").upsert({
          organisation_id: organisationId,
          normalised_email_hash: hashHex,
          masked_email: existingRecipient.masked_recipient,
          reason: "complaint",
          scope: "global",
          source_type: existingRecipient.source_type,
          source_reference: existingRecipient.source_id,
          is_permanent: true,
        }, { onConflict: "normalised_email_hash", ignoreDuplicates: false });
      }

      if (mappedEventType === "clicked" && body.data.link) {
        const url = body.data.link.url || "";
        const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();
        await supabase.from("email_link_clicks").insert({
          organisation_id: organisationId,
          recipient_message_id: existingRecipient.id,
          campaign_id: existingRecipient.source_type === "campaign" ? existingRecipient.source_id : null,
          automation_id: existingRecipient.source_type === "automation" ? existingRecipient.source_id : null,
          link_url: url,
          link_label: body.data.link.description || null,
          destination_domain: domain,
          clicked_at: eventTime,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, event: deliveryEvent?.id || null }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: "Processing error", detail: err instanceof Error ? err.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
