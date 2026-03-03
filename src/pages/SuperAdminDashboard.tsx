import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdminKPIs, OrgSummary } from '@/hooks/useSuperAdminKPIs';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2, Users, TrendingUp, Award, ArrowLeft,
  Shield, Heart, BarChart3, ExternalLink, Loader2, MessageSquare, Download, Paperclip,
  CircleDot, CheckCircle2, Eye
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FeedbackItem {
  id: string;
  user_name: string | null;
  message: string | null;
  file_name: string | null;
  file_type: string | null;
  file_data: string | null;
  created_at: string;
  status: 'new' | 'resolved';
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { profile, setViewAsOrg } = useAuth();
  const { orgs, platform, loading, error } = useSuperAdminKPIs();
  const [selectedOrg, setSelectedOrg] = useState<OrgSummary | null>(null); // reserved for future detail panel
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'new' | 'resolved'>('all');

  useEffect(() => {
    async function fetchFeedback() {
      setFeedbackLoading(true);
      try {
        const { data, error: fbError } = await (supabase
          .from('user_feedback' as any)
          .select('id, user_name, message, file_name, file_type, file_data, created_at, status')
          .order('created_at', { ascending: false }) as any);
        if (!fbError && data) setFeedbackItems(data as FeedbackItem[]);
      } catch (_) {
        // silently ignore — table may not exist yet
      } finally {
        setFeedbackLoading(false);
      }
    }
    if (profile?.is_super_admin) fetchFeedback();
  }, [profile?.is_super_admin]);

  const toggleFeedbackStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'new' ? 'resolved' : 'new';
    setFeedbackItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as 'new' | 'resolved' } : item));
    await (supabase
      .from('user_feedback' as any)
      .update({ status: newStatus })
      .eq('id', id) as any);
  };

  const newCount = feedbackItems.filter(f => f.status === 'new').length;
  const resolvedCount = feedbackItems.filter(f => f.status === 'resolved').length;
  const filteredFeedback = feedbackFilter === 'all'
    ? feedbackItems
    : feedbackItems.filter(f => f.status === feedbackFilter);

  const downloadFeedbackPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Feedback Log', 14, 18);
    doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [['Status', 'User', 'Date', 'Message', 'Attachment']],
      body: filteredFeedback.map((item) => [
        item.status === 'new' ? 'NEW' : 'RESOLVED',
        item.user_name || '—',
        new Date(item.created_at).toLocaleDateString(),
        (item.message || '').slice(0, 200) + ((item.message?.length || 0) > 200 ? '…' : ''),
        item.file_name ? item.file_name : '—',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 2: { cellWidth: 80 } },
    });
    doc.save(`feedback-log-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Guard — only super admins should reach this page
  if (!profile?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-6">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">This page is only accessible to super administrators.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center p-6">
          <p className="text-destructive">Error loading data: {error}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="full" size="sm" />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Super Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
              My Org Admin
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Platform-wide KPI cards */}
        {platform && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Organizations</span>
                  </div>
                  <div className="text-2xl font-bold">{platform.total_orgs}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {orgs.filter(o => o.audience_type === 'consumer').length} Consumer
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Total Users</span>
                  </div>
                  <div className="text-2xl font-bold">{platform.total_users}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.bank_user_count} bankers · {platform.ff_user_count} F&F
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Session Completion</span>
                  </div>
                  <div className="text-2xl font-bold">{platform.s1_completion_rate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    S2: {platform.s2_completion_rate}% · S3: {platform.s3_completion_rate}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Avg AI Proficiency</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {platform.avg_proficiency != null ? `${platform.avg_proficiency}%` : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {platform.total_active_users} active users
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Organizations tab */}
        <Tabs defaultValue="orgs">
          <TabsList>
            <TabsTrigger value="orgs" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organizations ({orgs.length})
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Completion Funnel
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
              {newCount > 0 && (
                <Badge className="h-4 px-1.5 text-[10px] bg-destructive text-destructive-foreground ml-1 rounded-full">
                  {newCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orgs" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">All Organizations</CardTitle>
                <CardDescription>Click any row to drill into that org's admin view</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">S1</TableHead>
                      <TableHead className="text-right">S2</TableHead>
                      <TableHead className="text-right">S3</TableHead>
                      <TableHead className="text-right">Avg Proficiency</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgs.map((org) => (
                      <TableRow
                        key={org.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admin?org_id=${org.id}`)}
                      >
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>
                          {org.audience_type === 'consumer' ? (
                            <Badge variant="secondary" className="gap-1">
                              <Heart className="h-3 w-3" />
                              Consumer
                            </Badge>
                          ) : (
                            <Badge variant="outline">{org.industry ? org.industry.charAt(0).toUpperCase() + org.industry.slice(1) : 'Enterprise'}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{org.user_count}</TableCell>
                        <TableCell className="text-right">
                          {org.user_count > 0
                            ? `${Math.round((org.s1_completed / org.user_count) * 100)}%`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {org.user_count > 0
                            ? `${Math.round((org.s2_completed / org.user_count) * 100)}%`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {org.user_count > 0
                            ? `${Math.round((org.s3_completed / org.user_count) * 100)}%`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {org.avg_proficiency != null ? `${org.avg_proficiency}%` : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin?org_id=${org.id}`);
                              }}
                              title="Open admin view for this org"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewAsOrg({
                                  id: org.id,
                                  name: org.name,
                                  audience_type: org.audience_type,
                                  industry: org.industry || 'banking',
                                });
                                navigate('/dashboard');
                              }}
                              title="Preview this org's user experience"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orgs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No organizations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Completion Funnel</CardTitle>
                <CardDescription>How users progress through the three sessions across all orgs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {platform && [
                  { label: 'Session 1 — AI Foundations', rate: platform.s1_completion_rate },
                  { label: 'Session 2 — AI Applications', rate: platform.s2_completion_rate },
                  { label: 'Session 3 — AI Leadership', rate: platform.s3_completion_rate },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.rate}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">By Organization</h3>
                  {orgs.filter(o => o.user_count > 0).map((org) => (
                    <div key={org.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{org.name}</span>
                        {org.audience_type === 'friends_family' && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Heart className="h-2.5 w-2.5" />F&F
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">{org.user_count} users</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: 'S1', completed: org.s1_completed },
                          { label: 'S2', completed: org.s2_completed },
                          { label: 'S3', completed: org.s3_completed },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-6">{s.label}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/70 rounded-full"
                                style={{ width: `${org.user_count > 0 ? (s.completed / org.user_count) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {s.completed}/{org.user_count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="feedback" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">User Feedback</CardTitle>
                    <CardDescription>
                      {feedbackItems.length} total
                      {newCount > 0 && ` · ${newCount} new`}
                      {resolvedCount > 0 && ` · ${resolvedCount} resolved`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                      {(['all', 'new', 'resolved'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFeedbackFilter(f)}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            feedbackFilter === f
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {f === 'all' ? 'All' : f === 'new' ? `New (${newCount})` : `Resolved (${resolvedCount})`}
                        </button>
                      ))}
                    </div>
                    {feedbackItems.length > 0 && (
                      <Button size="sm" variant="outline" className="gap-2" onClick={downloadFeedbackPdf}>
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Attachment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.map((item) => (
                        <TableRow
                          key={item.id}
                          className={item.status === 'new' ? 'bg-primary/5 hover:bg-primary/10' : ''}
                        >
                          <TableCell className="pr-0">
                            <button
                              onClick={() => toggleFeedbackStatus(item.id, item.status)}
                              title={item.status === 'new' ? 'Mark as resolved' : 'Reopen'}
                              className="transition-colors"
                            >
                              {item.status === 'new' ? (
                                <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300 bg-orange-50 hover:bg-green-50 hover:text-green-600 hover:border-green-300 cursor-pointer">
                                  <CircleDot className="h-3 w-3" />
                                  New
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-green-600 border-green-300 bg-green-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 cursor-pointer">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Resolved
                                </Badge>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className={`whitespace-nowrap ${item.status === 'new' ? 'font-semibold' : 'font-medium'}`}>
                            {item.user_name || '—'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                            {new Date(item.created_at).toLocaleDateString()}{' '}
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm whitespace-pre-wrap break-words">{item.message || '—'}</p>
                          </TableCell>
                          <TableCell>
                            {item.file_data && item.file_name ? (
                              <a
                                href={`data:${item.file_type || 'application/octet-stream'};base64,${item.file_data}`}
                                download={item.file_name}
                                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                              >
                                <Paperclip className="h-3 w-3" />
                                {item.file_name}
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFeedback.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {feedbackFilter === 'all' ? 'No feedback submitted yet' : `No ${feedbackFilter} feedback`}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
