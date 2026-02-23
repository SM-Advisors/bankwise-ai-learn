const PRODUCTION_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://bankwise-ai-learn.lovable.app";
const PUBLISHED_ORIGIN = "https://smile-enablement.lovable.app";
const PREVIEW_ORIGIN_SUFFIX = ".lovable.app";
const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"];

const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const isDev = Deno.env.get("ENVIRONMENT") === "development";
  let allowedOrigin: string;

  if (isDev && requestOrigin && DEV_ORIGINS.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else if (requestOrigin && requestOrigin.endsWith(PREVIEW_ORIGIN_SUFFIX)) {
    // Allow all Lovable preview/published domains
    allowedOrigin = requestOrigin;
  } else if (requestOrigin === PRODUCTION_ORIGIN || requestOrigin === PUBLISHED_ORIGIN) {
    allowedOrigin = requestOrigin;
  } else {
    allowedOrigin = PRODUCTION_ORIGIN;
  }

  return {
    ...CORS_HEADERS_BASE,
    "Access-Control-Allow-Origin": allowedOrigin,
  };
}
