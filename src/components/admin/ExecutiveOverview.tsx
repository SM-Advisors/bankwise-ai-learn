import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, TrendingUp, AlertTriangle, Lightbulb, Activity,
  ChevronRight, ShieldAlert, Building2, BarChart3,
} from 'lucide-react';
import { useCSuiteKPIs, getLobLabel } from '@/hooks/useReporting';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── Executive Overview ──────────────────────────────────────────────────────
// Default landing for the Admin panel. Designed for C-suite executives who need
// a 10-second read on how AI enablement is going, what needs attention, and
// an inline Andrea advisor for deeper questions.

interface ExecutiveOverviewProps {
  organizationId?: string | null;
  onNavigateTab: (tab: string) => void;
}

const BRAND = { navy: '#202735', orange: '#dd4124' };
const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e'];

export function ExecutiveOverview({ organizationId, onNavigateTab }: ExecutiveOverviewProps) {
  const { profile } = useAuth();
  const kpis = useCSuiteKPIs(organizationId || null);

  const firstName = profile?.display_name?.split(' ')[0] || 'there';

  // Build attention items from KPI data
  const attentionItems = useMemo(() => {
    if (kpis.loading) return [];
    const items: { icon: React.ElementType; text: string; severity: 'high' | 'medium' | 'low'; action: string; tab: string }[] = [];

    // Compliance exceptions
    if (kpis.totalExceptions > 0) {
      items.push({
        icon: ShieldAlert,
        text: `${kpis.totalExceptions} compliance exception${kpis.totalExceptions !== 1 ? 's' : ''} flagged${kpis.repeatOffenders.length > 0 ? ` (${kpis.repeatOffenders.length} repeat)` : ''}`,
        severity: kpis.repeatOffenders.length > 0 ? 'high' : 'medium',
        action: 'Review exceptions',
        tab: 'analytics',
      });
    }

    // Low completion departments
    const lowDepts = kpis.departmentBreakdowns.filter(d => d.total >= 3 && (d.s1 / d.total) < 0.4);
    if (lowDepts.length > 0) {
      const worst = lowDepts.sort((a, b) => (a.s1 / a.total) - (b.s1 / b.total))[0];
      items.push({
        icon: Building2,
        text: `${worst.label} has the lowest completion — ${Math.round((worst.s1 / worst.total) * 100)}% through Session 1`,
        severity: 'medium',
        action: 'View departments',
        tab: 'analytics',
      });
    }

    // Stalled completion funnel (big drop-off between sessions)
    if (kpis.funnelData.length >= 2) {
      const s1Rate = kpis.funnelData[0]?.rate || 0;
      const s2Rate = kpis.funnelData[1]?.rate || 0;
      if (s1Rate > 0 && s2Rate > 0 && (s1Rate - s2Rate) > 30) {
        items.push({
          icon: TrendingUp,
          text: `${s1Rate - s2Rate}% drop-off between Session 1 and 2 — learners may be getting stuck`,
          severity: 'medium',
          action: 'View funnel',
          tab: 'analytics',
        });
      }
    }

    // Pending ideas
    const pendingIdeas = kpis.ideasByStatus?.submitted || kpis.ideasByStatus?.not_started || 0;
    if (pendingIdeas > 0) {
      items.push({
        icon: Lightbulb,
        text: `${pendingIdeas} idea${pendingIdeas !== 1 ? 's' : ''} awaiting review from your team`,
        severity: 'low',
        action: 'Review ideas',
        tab: 'engagement',
      });
    }

    return items;
  }, [kpis]);

  if (kpis.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Activity className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Loading your enablement data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold">
          Hi {firstName} — here's your enablement snapshot
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Key metrics and action items across your AI training program
        </p>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 justify-items-center">
        <KPICard
          icon={Users}
          label="Enrolled"
          value={kpis.totalEnrolled}
          subtitle={`${kpis.enrollmentRate}% enrollment rate`}
          color="text-blue-600"
          bg="bg-blue-500/10"
          onClick={() => onNavigateTab('people')}
        />
        <KPICard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${kpis.completionRate}%`}
          subtitle={`${kpis.fullyCompleted} completed all 5 sessions`}
          color="text-green-600"
          bg="bg-green-500/10"
          onClick={() => onNavigateTab('analytics')}
        />
        <KPICard
          icon={AlertTriangle}
          label="Exceptions"
          value={kpis.totalExceptions}
          subtitle={`${kpis.exceptionRate}% exception rate`}
          color={kpis.totalExceptions > 0 ? 'text-red-600' : 'text-green-600'}
          bg={kpis.totalExceptions > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}
          onClick={() => onNavigateTab('analytics')}
        />
        <KPICard
          icon={Lightbulb}
          label="Ideas Submitted"
          value={kpis.totalIdeas}
          subtitle={`${Object.values(kpis.ideasByStatus).reduce((a, b) => a + b, 0) - (kpis.ideasByStatus?.completed || 0)} in pipeline`}
          color="text-amber-600"
          bg="bg-amber-500/10"
          onClick={() => onNavigateTab('engagement')}
        />
      </div>

      {/* Needs Attention */}
      {attentionItems.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Needs Your Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attentionItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background/80 border border-border/50">
                  <div className={`p-1.5 rounded-md shrink-0 ${
                    item.severity === 'high' ? 'bg-red-500/10 text-red-600' :
                    item.severity === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-blue-500/10 text-blue-600'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm flex-1">{item.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
                    onClick={() => onNavigateTab(item.tab)}
                  >
                    {item.action}
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Funnel + Department highlights */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Session Completion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Session Completion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.funnelData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={24}>
                    {kpis.funnelData.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Highlights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Department Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {kpis.departmentBreakdowns.slice(0, 6).map((dept) => {
                const completionPct = dept.total > 0 ? Math.round((dept.s5 / dept.total) * 100) : 0;
                return (
                  <div key={dept.label} className="flex items-center gap-3">
                    <span className="text-sm w-28 truncate">{dept.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${completionPct}%`,
                          backgroundColor: completionPct >= 60 ? '#22c55e' : completionPct >= 30 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{completionPct}%</span>
                  </div>
                );
              })}
            </div>
            {kpis.departmentBreakdowns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs text-muted-foreground w-full gap-1"
                onClick={() => onNavigateTab('analytics')}
              >
                View full breakdown
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-bold">{kpis.activeUsers7d}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Active (7 days)</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{kpis.avgProficiency}<span className="text-sm font-normal text-muted-foreground">/8</span></div>
          <p className="text-xs text-muted-foreground mt-0.5">Avg Proficiency</p>
        </Card>
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, subtitle, color, bg, onClick }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 ${onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg} shrink-0`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
