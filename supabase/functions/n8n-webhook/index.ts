
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing Supabase configuration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const agentId = pathParts[pathParts.length - 1];

    if (req.method === "GET") {
      if (agentId && agentId !== "n8n-webhook" && agentId.length > 30) {
        const { data: agent, error } = await supabase
          .from("digital_footprint_n8n_agents")
          .select("*")
          .eq("id", agentId)
          .maybeSingle();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, agent }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: agents, error } = await supabase
        .from("digital_footprint_n8n_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, agents }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();

      const targetAgentId = body.agent_id || agentId;

      if (!targetAgentId || targetAgentId === "n8n-webhook") {
        return new Response(
          JSON.stringify({ success: false, error: "agent_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updatePayload: Record<string, unknown> = {};

      if (body.workflow_name !== undefined) updatePayload.workflow_name = body.workflow_name;
      if (body.status !== undefined) updatePayload.status = body.status;
      if (body.last_run_at !== undefined) updatePayload.last_run_at = body.last_run_at;
      if (body.last_success_at !== undefined) updatePayload.last_success_at = body.last_success_at;
      if (body.last_failure_at !== undefined) updatePayload.last_failure_at = body.last_failure_at;
      if (body.latest_error !== undefined) updatePayload.latest_error = body.latest_error;
      if (body.leads_generated !== undefined) updatePayload.leads_generated = body.leads_generated;
      if (body.health_score !== undefined) updatePayload.health_score = body.health_score;
      updatePayload.updated_at = new Date().toISOString();

      if (Object.keys(updatePayload).length <= 1) {
        return new Response(
          JSON.stringify({ success: false, error: "No valid fields to update" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: agent, error } = await supabase
        .from("digital_footprint_n8n_agents")
        .update(updatePayload)
        .eq("id", targetAgentId)
        .select("*")
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!agent) {
        return new Response(
          JSON.stringify({ success: false, error: "Agent not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, agent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
