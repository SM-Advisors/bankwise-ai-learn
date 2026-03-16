import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  audience_type: string;
  industry: string | null;
  created_at: string;
  user_count: number;
  active_user_count: number;
  s1_completed: number;
  s2_completed: number;
  s3_completed: number;
  s4_completed: number;
  s5_completed: number;
  avg_proficiency: number | null;
};

type PlatformKPIs = {
  total_orgs: number;
  total_users: number;
  total_active_users: number;
  s1_completion_rate: number;
  s2_completion_rate: number;
  s3_completion_rate: number;
  s4_completion_rate: number;
  s5_completion_rate: number;
  avg_proficiency: number | null;
  ff_user_count: number;
  bank_user_count: number;
};

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  audience_type: string | null;
  industry: string | null;
  created_at: string;
};

type ProfileRow = {
  user_id: string;
  organization_id: string | null;
  ai_proficiency_level: number | null;
  is_active: boolean | null;
};

type ProgressRow = {
  user_id: string;
  session_1_completed: boolean | null;
  session_2_completed: boolean | null;
  session_3_completed: boolean | null;
  session_4_completed: boolean | null;
  session_5_completed: boolean | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("user_profiles")
      .select("is_super_admin")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!callerProfile?.is_super_admin) {
      return new Response(JSON.stringify({ error: "Super admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [
      { data: orgsData, error: orgsError },
      { data: profilesData, error: profilesError },
      { data: progressData, error: progressError },
    ] = await Promise.all([
      adminClient
        .from("organizations")
        .select("id, name, slug, audience_type, industry, created_at")
        .order("created_at", { ascending: false }),
      adminClient
        .from("user_profiles")
        .select("user_id, organization_id, ai_proficiency_level, is_active"),
      adminClient
        .from("training_progress")
        .select("user_id, session_1_completed, session_2_completed, session_3_completed, session_4_completed, session_5_completed"),
    ]);

    if (orgsError) throw orgsError;
    if (profilesError) throw profilesError;
    if (progressError) throw progressError;

    const orgRows: OrgRow[] = orgsData || [];
    const profileRows: ProfileRow[] = profilesData || [];
    const progressRows: ProgressRow[] = progressData || [];

    const orgMap = new Map<string, OrgSummary>();
    for (const org of orgRows) {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        slug: org.slug,
        audience_type: org.audience_type || "enterprise",
        industry: org.industry || null,
        created_at: org.created_at,
        user_count: 0,
        active_user_count: 0,
        s1_completed: 0,
        s2_completed: 0,
        s3_completed: 0,
        s4_completed: 0,
        s5_completed: 0,
        avg_proficiency: null,
      });
    }

    const proficiencyByOrg = new Map<string, number[]>();
    const profileByUserId = new Map(profileRows.map((profile) => [profile.user_id, profile]));

    for (const profile of profileRows) {
      if (!profile.organization_id) continue;
      const org = orgMap.get(profile.organization_id);
      if (!org) continue;

      org.user_count += 1;
      if (profile.is_active !== false) org.active_user_count += 1;

      if (profile.ai_proficiency_level != null) {
        if (!proficiencyByOrg.has(profile.organization_id)) {
          proficiencyByOrg.set(profile.organization_id, []);
        }
        proficiencyByOrg.get(profile.organization_id)!.push(profile.ai_proficiency_level);
      }
    }

    for (const row of progressRows) {
      const profile = profileByUserId.get(row.user_id);
      if (!profile?.organization_id) continue;

      const org = orgMap.get(profile.organization_id);
      if (!org) continue;

      if (row.session_1_completed) org.s1_completed += 1;
      if (row.session_2_completed) org.s2_completed += 1;
      if (row.session_3_completed) org.s3_completed += 1;
      if (row.session_4_completed) org.s4_completed += 1;
      if (row.session_5_completed) org.s5_completed += 1;
    }

    for (const [orgId, scores] of proficiencyByOrg.entries()) {
      const org = orgMap.get(orgId);
      if (!org || scores.length === 0) continue;
      org.avg_proficiency = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    const orgs = Array.from(orgMap.values());
    const totalUsers = profileRows.length;
    const totalActiveUsers = profileRows.filter((profile) => profile.is_active !== false).length;

    const allScores = profileRows
      .map((profile) => profile.ai_proficiency_level)
      .filter((score): score is number => score != null);

    const ffOrgIds = new Set(orgRows.filter((org) => org.audience_type === "consumer").map((org) => org.id));
    const ffUserCount = profileRows.filter((profile) => !!profile.organization_id && ffOrgIds.has(profile.organization_id)).length;

    const s1Total = progressRows.filter((row) => !!row.session_1_completed).length;
    const s2Total = progressRows.filter((row) => !!row.session_2_completed).length;
    const s3Total = progressRows.filter((row) => !!row.session_3_completed).length;
    const s4Total = progressRows.filter((row) => !!row.session_4_completed).length;
    const s5Total = progressRows.filter((row) => !!row.session_5_completed).length;
    const progressTotal = progressRows.length;

    const platform: PlatformKPIs = {
      total_orgs: orgRows.length,
      total_users: totalUsers,
      total_active_users: totalActiveUsers,
      s1_completion_rate: progressTotal > 0 ? Math.round((s1Total / progressTotal) * 100) : 0,
      s2_completion_rate: progressTotal > 0 ? Math.round((s2Total / progressTotal) * 100) : 0,
      s3_completion_rate: progressTotal > 0 ? Math.round((s3Total / progressTotal) * 100) : 0,
      s4_completion_rate: progressTotal > 0 ? Math.round((s4Total / progressTotal) * 100) : 0,
      s5_completion_rate: progressTotal > 0 ? Math.round((s5Total / progressTotal) * 100) : 0,
      avg_proficiency: allScores.length > 0
        ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
        : null,
      ff_user_count: ffUserCount,
      bank_user_count: totalUsers - ffUserCount,
    };

    return new Response(JSON.stringify({ orgs, platform }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
