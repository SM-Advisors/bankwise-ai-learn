-- ============================================================
-- Data Retention Cron Jobs (requires pg_cron extension)
-- Enable pg_cron in Supabase Dashboard > Database > Extensions
-- before running this migration.
-- ============================================================

-- Delete practice conversations older than 12 months
SELECT cron.schedule(
  'delete-old-practice-conversations',
  '0 2 1 * *',
  $$DELETE FROM practice_conversations WHERE created_at < now() - INTERVAL '12 months'$$
);

-- Delete dashboard conversations older than 12 months
SELECT cron.schedule(
  'delete-old-dashboard-conversations',
  '0 2 1 * *',
  $$DELETE FROM dashboard_conversations WHERE created_at < now() - INTERVAL '12 months'$$
);

-- Delete skill observations older than 12 months
SELECT cron.schedule(
  'delete-old-skill-observations',
  '0 2 1 * *',
  $$DELETE FROM skill_observations WHERE created_at < now() - INTERVAL '12 months'$$
);

-- Prune rate_limit_events older than 30 days (daily cleanup)
SELECT cron.schedule(
  'delete-old-rate-limit-events',
  '0 3 * * *',
  $$DELETE FROM rate_limit_events WHERE created_at < now() - INTERVAL '30 days'$$
);
