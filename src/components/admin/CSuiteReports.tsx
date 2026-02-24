import { useState } from 'react';
import { useCSuiteKPIs, LOB_LABELS, type IdeaItem } from '@/hooks/useReporting';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users, TrendingUp, AlertTriangle, Lightbulb, Activity,
  BarChart3, ShieldAlert, Loader2, Award, Building2, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';

// Brand-aligned chart colors
const BRAND_NAVY = '#202735';
const BRAND_ORANGE = '#dd4124';
const CHART_COLORS = ['#dd4124', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

const STATUS_LABELS: Record<string, string> = {
  not_started: 'New',
  needs_knowledge: 'Needs Knowledge',
  future: 'Future',
  under_review: 'Under Review',
  approved: 'Approved',
  implementing: 'Implementing',
  completed: 'Completed',
};

const ROI_BADGE: Record<string, { className: string; label: string }> = {
  high: { className: 'bg-green-500/10 text-green-700 border-green-500/30', label: 'High Impact' },
  medium: { className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30', label: 'Medium Impact' },
  low: { className: 'bg-gray-500/10 text-gray-600 border-gray-500/30', label: 'Low Impact' },
};

// ---------------------------------------------------------------------------
// KPI Card -- board-level stat card
// ---------------------------------------------------------------------------
function KPICard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        {trend && (
          <p className="text-xs font-medium text-accent mt-2">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function CSuiteReports() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { organizations, loading: orgsLoading } = useOrganizations();
  const kpis = useCSuiteKPIs(selectedOrgId);

  const handleExportCSV = () => {
    if (!kpis) return;
    const lines: string[] = [];
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');

    lines.push(`SMILE AI Training Report — ${date}`);
    lines.push('');
    lines.push('PROGRAM OVERVIEW');
    lines.push('"Metric","Value"');
    lines.push(`"Total Enrolled","${kpis.totalEnrolled ?? 0}"`);
    lines.push(`"Fully Completed","${kpis.fullyCompleted ?? 0}"`);
    lines.push(`"In Progress","${(kpis.totalEnrolled ?? 0) - (kpis.fullyCompleted ?? 0)}"`);
    lines.push(`"Completion Rate","${kpis.completionRate ?? 0}%"`);
    lines.push(`"Avg AI Proficiency Level","${kpis.avgProficiency ?? 0}"`);
    lines.push('');
    lines.push('COMPLIANCE');
    lines.push('"Exception Type","Count"');
    (kpis.exceptionTypes || []).forEach((item) => {
      lines.push(`"${item.label || item.type || ''}","${item.count ?? 0}"`);
    });
    lines.push('');
    lines.push(`"Total Exceptions","${kpis.totalExceptions ?? 0}"`);
    lines.push(`"Exception Rate","${kpis.exceptionRate ?? 0}%"`);
    lines.push('');
    lines.push('DEPARTMENT BREAKDOWN');
    lines.push('"Department","Users","S1","S2","S3","Avg Level"');
    (kpis.departmentBreakdowns || []).forEach((item) => {
      lines.push(`"${item.label || item.department || ''}","${item.total ?? 0}","${item.s1 ?? 0}","${item.s2 ?? 0}","${item.s3 ?? 0}","${item.avgProficiency ?? 0}"`);
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smile-ai-report-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (kpis.loading && orgsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">C-Suite Executive Dashboard</h2>
          <p className="text-muted-foreground mt-1">AI Enablement program performance, compliance, and innovation metrics</p>
        </div>

        {/* Organization filter */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedOrgId ?? 'all'}
            onValueChange={(value) => setSelectedOrgId(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            title="Export as CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress & Adoption
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="innovation" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Innovation Pipeline
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB 1: Progress & Adoption                                        */}
        {/* ================================================================= */}
        <TabsContent value="progress" className="space-y-6">
          {/* KPI Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={Users}
              title="Total Enrolled"
              value={kpis.totalEnrolled}
              subtitle={`${kpis.enrollmentRate}% enrollment rate`}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-600"
            />
            <KPICard
              icon={Award}
              title="Fully Completed"
              value={kpis.fullyCompleted}
              subtitle={`${kpis.completionRate}% completion rate`}
              iconBg="bg-green-500/10"
              iconColor="text-green-600"
            />
            <KPICard
              icon={Activity}
              title="Active (7 days)"
              value={kpis.activeUsers7d}
              subtitle={`${kpis.activeUsers30d} in last 30 days`}
              iconBg="bg-accent/10"
              iconColor="text-accent"
            />
            <KPICard
              icon={BarChart3}
              title="Avg Proficiency"
              value={`${kpis.avgProficiency} / 8`}
              subtitle="Org-wide AI skill level"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-600"
            />
          </div>

          {/* Session Completion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Completion Funnel</CardTitle>
              <CardDescription>Learner progression through the 3-session program</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kpis.funnelData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, Math.max(kpis.totalEnrolled, 1)]} />
                  <YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 13 }} />
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) =>
                      [`${value} / ${props.payload.total} (${props.payload.rate}%)`, 'Completed']
                    }
                  />
                  <Bar dataKey="completed" fill={BRAND_ORANGE} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Two columns: Skill Distribution + Department Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Skill Distribution Donut */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skill Level Distribution</CardTitle>
                <CardDescription>AI proficiency across all enrolled learners</CardDescription>
              </CardHeader>
              <CardContent>
                {kpis.skillDistribution.some((s) => s.value > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={kpis.skillDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {kpis.skillDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No proficiency data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Department Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Department Breakdown</CardTitle>
                <CardDescription>Adoption and completion by line of business</CardDescription>
              </CardHeader>
              <CardContent>
                {kpis.departmentBreakdowns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 px-2 font-medium">Department</th>
                          <th className="text-center py-2 px-2 font-medium">Users</th>
                          <th className="text-center py-2 px-2 font-medium">S1</th>
                          <th className="text-center py-2 px-2 font-medium">S2</th>
                          <th className="text-center py-2 px-2 font-medium">S3</th>
                          <th className="text-center py-2 px-2 font-medium">Avg Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpis.departmentBreakdowns.map((dept) => (
                          <tr key={dept.department} className="border-b hover:bg-muted/50">
                            <td className="py-2.5 px-2 font-medium">{dept.label}</td>
                            <td className="py-2.5 px-2 text-center">{dept.total}</td>
                            <td className="py-2.5 px-2 text-center text-green-600 font-medium">{dept.s1}</td>
                            <td className="py-2.5 px-2 text-center text-blue-600 font-medium">{dept.s2}</td>
                            <td className="py-2.5 px-2 text-center text-purple-600 font-medium">{dept.s3}</td>
                            <td className="py-2.5 px-2 text-center">
                              <Badge variant="outline" className="text-xs">{dept.avgProficiency}/8</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No department data yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 2: Compliance                                                 */}
        {/* ================================================================= */}
        <TabsContent value="compliance" className="space-y-6">
          {/* KPI Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={AlertTriangle}
              title="Total Exceptions"
              value={kpis.totalExceptions}
              subtitle="All-time flagged interactions"
              iconBg="bg-red-500/10"
              iconColor="text-red-600"
            />
            <KPICard
              icon={ShieldAlert}
              title="Exception Rate"
              value={`${kpis.exceptionRate}%`}
              subtitle="Of all submitted prompts"
              iconBg="bg-orange-500/10"
              iconColor="text-orange-600"
            />
            <KPICard
              icon={Users}
              title="Repeat Concerns"
              value={kpis.repeatOffenders.length}
              subtitle="Users with 2+ exceptions"
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-600"
            />
            <KPICard
              icon={Building2}
              title="Departments Affected"
              value={kpis.exceptionsByDept.length}
              subtitle="With flagged interactions"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-600"
            />
          </div>

          {/* Exception Trend (30-day) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exception Trend (30 Days)</CardTitle>
              <CardDescription>Daily compliance exceptions overlaid with prompt volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={kpis.exceptionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="prompts"
                    name="Total Prompts"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="exceptions"
                    name="Exceptions"
                    stroke={BRAND_ORANGE}
                    fill={BRAND_ORANGE}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Two columns: Exception Types + By Department */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Exception Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exception Types</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                {kpis.exceptionTypes.length > 0 ? (
                  <div className="space-y-3">
                    {kpis.exceptionTypes.map((item) => {
                      const maxCount = Math.max(...kpis.exceptionTypes.map((t) => t.count), 1);
                      const pct = Math.round((item.count / maxCount) * 100);
                      return (
                        <div key={item.type}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-muted-foreground">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No exceptions recorded yet</div>
                )}
              </CardContent>
            </Card>

            {/* Exceptions by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exceptions by Department</CardTitle>
                <CardDescription>Which lines of business have the most flags</CardDescription>
              </CardHeader>
              <CardContent>
                {kpis.exceptionsByDept.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={kpis.exceptionsByDept}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Exceptions" fill={BRAND_ORANGE} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No department exceptions yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Repeat Offenders */}
          {kpis.repeatOffenders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Repeat Concerns</CardTitle>
                <CardDescription>Users with 2 or more compliance exceptions (for HR/compliance follow-up)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 px-3 font-medium">Name</th>
                        <th className="text-left py-2 px-3 font-medium">Department</th>
                        <th className="text-center py-2 px-3 font-medium">Exceptions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.repeatOffenders.map((user) => (
                        <tr key={user.user_id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-medium">{user.display_name || 'Unknown'}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-xs">
                              {LOB_LABELS[user.department || ''] || user.department || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="destructive" className="text-xs">{user.exception_count}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: Innovation Pipeline                                        */}
        {/* ================================================================= */}
        <TabsContent value="innovation" className="space-y-6">
          {/* KPI Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              icon={Lightbulb}
              title="Total Ideas"
              value={kpis.totalIdeas}
              subtitle="Submitted by users"
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-600"
            />
            <KPICard
              icon={TrendingUp}
              title="Under Review"
              value={kpis.ideasByStatus['under_review'] || 0}
              subtitle="Being evaluated"
              iconBg="bg-blue-500/10"
              iconColor="text-blue-600"
            />
            <KPICard
              icon={Award}
              title="Approved"
              value={(kpis.ideasByStatus['approved'] || 0) + (kpis.ideasByStatus['implementing'] || 0)}
              subtitle="Approved or implementing"
              iconBg="bg-green-500/10"
              iconColor="text-green-600"
            />
            <KPICard
              icon={Activity}
              title="Completed"
              value={kpis.ideasByStatus['completed'] || 0}
              subtitle="Ideas implemented"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-600"
            />
          </div>

          {/* Status Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Idea Pipeline</CardTitle>
              <CardDescription>Ideas grouped by workflow stage</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(kpis.ideasByStatus).length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={Object.entries(kpis.ideasByStatus).map(([status, count]) => ({
                      status: STATUS_LABELS[status] || status,
                      count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Ideas" fill={BRAND_ORANGE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No ideas submitted yet</div>
              )}
            </CardContent>
          </Card>

          {/* Top Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Ideas</CardTitle>
              <CardDescription>Highest-voted ideas from the organization</CardDescription>
            </CardHeader>
            <CardContent>
              {kpis.topIdeas.length > 0 ? (
                <div className="space-y-3">
                  {kpis.topIdeas.map((idea, idx) => (
                    <div key={idea.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col items-center min-w-[40px]">
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        <span className="text-lg font-bold text-accent">{idea.votes || 0}</span>
                        <span className="text-xs text-muted-foreground">votes</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm">{idea.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {STATUS_LABELS[idea.status] || idea.status}
                          </Badge>
                          {idea.roi_impact && ROI_BADGE[idea.roi_impact] && (
                            <Badge variant="outline" className={`text-xs ${ROI_BADGE[idea.roi_impact].className}`}>
                              {ROI_BADGE[idea.roi_impact].label}
                            </Badge>
                          )}
                        </div>
                        {idea.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {idea.submitter_name && <span>By {idea.submitter_name}</span>}
                          {idea.submitter_department && (
                            <Badge variant="secondary" className="text-xs">
                              {LOB_LABELS[idea.submitter_department] || idea.submitter_department}
                            </Badge>
                          )}
                          <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  No ideas submitted yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
