

## Enable pg_cron Extension

### What we'll do
Run a single SQL migration to enable the `pg_cron` (and `pg_net`) extensions in your database. This is a prerequisite for setting up scheduled jobs like data retention crons.

### Technical Details

**Migration SQL:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

This enables:
- **pg_cron** -- allows scheduling recurring SQL jobs (like a cron job inside your database)
- **pg_net** -- allows making HTTP requests from within the database (needed if your cron jobs call edge functions)

### Steps
1. Run the migration above to enable both extensions
2. Once confirmed, you can then run your Data Retention Cron migration

No code file changes are needed -- this is purely a database-level change.
