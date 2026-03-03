import { AppShell } from '@/components/shell';
import { CommunityFeed } from '@/components/CommunityFeed';

// ─── Community zone page ──────────────────────────────────────────────────────
//
// Wraps the existing CommunityFeed in AppShell.
// Unlocked after first practice chat is started (first_practice_done gate).

export default function CommunityZone() {
  return (
    <AppShell breadcrumbs={[{ label: 'Community' }]}>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Community</h1>
          <p className="text-sm text-muted-foreground">
            Share AI wins, ask questions, and see how your peers are applying what they've learned.
          </p>
        </div>
        <CommunityFeed />
      </div>
    </AppShell>
  );
}
