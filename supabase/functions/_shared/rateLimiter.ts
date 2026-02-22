import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitConfig {
  perMinute: number;
  perDay: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  trainer_chat:       { perMinute: 30, perDay: 200 },
  "ai-practice":      { perMinute: 60, perDay: 500 },
  practice_chat:      { perMinute: 60, perDay: 500 },
  submission_review:  { perMinute: 10, perDay: 50  },
  "agent-test-chat":  { perMinute: 30, perDay: 200 },
  "workflow-test-chat": { perMinute: 30, perDay: 200 },
};

export async function checkRateLimit(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  functionName: string,
  customLimits?: RateLimitConfig,
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = customLimits || DEFAULT_LIMITS[functionName] || { perMinute: 30, perDay: 200 };

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // Count events in the last minute and last 24 hours in parallel
    const [minuteResult, dayResult] = await Promise.all([
      adminClient
        .from("rate_limit_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("function_name", functionName)
        .gte("created_at", oneMinuteAgo),
      adminClient
        .from("rate_limit_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("function_name", functionName)
        .gte("created_at", oneDayAgo),
    ]);

    const minuteCount = minuteResult.count ?? 0;
    const dayCount = dayResult.count ?? 0;

    if (minuteCount >= limits.perMinute) {
      return { allowed: false, reason: `Rate limit exceeded: ${limits.perMinute} requests per minute. Please wait a moment.` };
    }
    if (dayCount >= limits.perDay) {
      return { allowed: false, reason: `Daily limit reached: ${limits.perDay} requests per day. Your limit resets tomorrow.` };
    }

    // Record this event (fire-and-forget)
    adminClient
      .from("rate_limit_events")
      .insert({ user_id: userId, function_name: functionName })
      .then(() => {});

    return { allowed: true };
  } catch (err) {
    // On error, allow the request (fail open — don't block users due to rate limit DB issues)
    console.error("[rateLimiter] Error checking rate limit:", err);
    return { allowed: true };
  }
}
