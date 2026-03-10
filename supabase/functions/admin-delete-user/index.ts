import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await callerClient.from("user_roles").select("role").eq("user_id", caller.id).maybeSingle();
    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify org membership: caller must be in same org as target (or be super admin)
    const { data: callerProfile } = await adminClient
      .from("user_profiles")
      .select("organization_id, is_super_admin")
      .eq("user_id", caller.id)
      .maybeSingle();

    const { data: targetProfile } = await adminClient
      .from("user_profiles")
      .select("organization_id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!callerProfile?.is_super_admin && callerProfile?.organization_id !== targetProfile?.organization_id) {
      return new Response(JSON.stringify({ error: "Cannot delete users from another organization" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete from public tables first — order matters for FK constraints.
    // Tables with user_id FK to auth.users cascade on auth deletion, but we
    // explicitly clean up to avoid edge-case FK errors from tables that
    // reference other user-owned rows (e.g. community_replies → community_topics).
    await adminClient.from("community_replies").delete().eq("user_id", user_id);
    await adminClient.from("community_topics").delete().eq("user_id", user_id);
    await adminClient.from("practice_conversations").delete().eq("user_id", user_id);
    await adminClient.from("dashboard_conversations" as any).delete().eq("user_id", user_id);
    await adminClient.from("agent_test_conversations" as any).delete().eq("user_id", user_id);
    await adminClient.from("user_agents").delete().eq("user_id", user_id);
    await adminClient.from("user_ideas" as any).delete().eq("user_id", user_id);
    await adminClient.from("prompt_events").delete().eq("user_id", user_id);
    await adminClient.from("ai_preferences").delete().eq("user_id", user_id);
    await adminClient.from("ai_memories").delete().eq("user_id", user_id);
    await adminClient.from("skill_observations" as any).delete().eq("user_id", user_id);
    await adminClient.from("response_feedback" as any).delete().eq("user_id", user_id);
    await adminClient.from("submission_scores" as any).delete().eq("user_id", user_id);
    await adminClient.from("retrieval_responses" as any).delete().eq("user_id", user_id);
    await adminClient.from("rate_limit_events" as any).delete().eq("user_id", user_id);
    await adminClient.from("user_roles").delete().eq("user_id", user_id);
    await adminClient.from("training_progress").delete().eq("user_id", user_id);
    await adminClient.from("user_profiles").delete().eq("user_id", user_id);

    // Delete the auth user (cascades any remaining FK references)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
