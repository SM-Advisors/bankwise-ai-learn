-- Add code preview columns to user_ideas and executive_submissions
-- Supports the "Build Preview" feature that generates interactive HTML prototypes via Claude

-- ─── 1. EXTEND user_ideas ───────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_ideas') THEN
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS preview_html TEXT';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS preview_status TEXT NOT NULL DEFAULT ''none''';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS preview_generated_at TIMESTAMPTZ';

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_preview_status') THEN
      EXECUTE 'ALTER TABLE user_ideas ADD CONSTRAINT chk_preview_status CHECK (preview_status IN (''none'', ''generating'', ''generated'', ''failed''))';
    END IF;
  END IF;
END $$;

-- ─── 2. EXTEND executive_submissions ────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'executive_submissions') THEN
    EXECUTE 'ALTER TABLE executive_submissions ADD COLUMN IF NOT EXISTS preview_html TEXT';
    EXECUTE 'ALTER TABLE executive_submissions ADD COLUMN IF NOT EXISTS preview_status TEXT NOT NULL DEFAULT ''none''';
    EXECUTE 'ALTER TABLE executive_submissions ADD COLUMN IF NOT EXISTS preview_generated_at TIMESTAMPTZ';

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_exec_preview_status') THEN
      EXECUTE 'ALTER TABLE executive_submissions ADD CONSTRAINT chk_exec_preview_status CHECK (preview_status IN (''none'', ''generating'', ''generated'', ''failed''))';
    END IF;
  END IF;
END $$;
