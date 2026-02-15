import { useState, useMemo } from 'react';
import { useReporting, type UserProgressRow } from '@/hooks/useReporting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const LOB_LABELS: Record<string, string> = {
  accounting_finance: 'Accounting & Finance',
  credit_administration: 'Credit Administration',
  executive_leadership: 'Executive & Leadership',
};

export function ProgressDashboard() {
  const { userProgress, promptStats, loading } = useReporting();
  const [lobFilter, setLobFilter] = useState<string | null>(null);

  const filteredProgress = useMemo(() => {
    if (!lobFilter) return userProgress;
    return userProgress.filter((u) => u.line_of_business === lobFilter);
  }, [userProgress, lobFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Compute session completion stats
  const sessionCompletionData = [
    {
      name: 'Session 1',
      completed: filteredProgress.filter((u) => u.session_1_completed).length,
      total: filteredProgress.length,
    },
    {
      name: 'Session 2',
      completed: filteredProgress.filter((u) => u.session_2_completed).length,
      total: filteredProgress.length,
    },
    {
      name: 'Session 3',
      completed: filteredProgress.filter((u) => u.session_3_completed).length,
      total: filteredProgress.length,
    },
  ];

  // Skill level distribution
  const skillLevels: Record<string, number> = {};
  filteredProgress.forEach((u) => {
    const level = u.ai_proficiency_level ?? 0;
    let label: string;
    if (level <= 2) label = 'Beginner (0-2)';
    else if (level <= 5) label = 'Intermediate (3-5)';
    else label = 'Advanced (6-8)';
    skillLevels[label] = (skillLevels[label] || 0) + 1;
  });
  const skillDistData = Object.entries(skillLevels).map(([name, value]) => ({ name, value }));

  // LOB distribution
  const lobDist: Record<string, number> = {};
  filteredProgress.forEach((u) => {
    const label = LOB_LABELS[u.line_of_business || ''] || 'Unknown';
    lobDist[label] = (lobDist[label] || 0) + 1;
  });
  const lobDistData = Object.entries(lobDist).map(([name, value]) => ({ name, value }));

  const totalUsers = filteredProgress.length;
  const fullyCompleted = filteredProgress.filter(
    (u) => u.session_1_completed && u.session_2_completed && u.session_3_completed
  ).length;

  const uniqueLobs = [...new Set(userProgress.map((u) => u.line_of_business).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filter by LOB:</span>
        <Button
          variant={lobFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLobFilter(null)}
        >
          All
        </Button>
        {uniqueLobs.map((lob) => (
          <Button
            key={lob}
            variant={lobFilter === lob ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLobFilter(lob!)}
          >
            {LOB_LABELS[lob!] || lob}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{fullyCompleted}</p>
                <p className="text-sm text-muted-foreground">Fully Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promptStats.total_prompts}</p>
                <p className="text-sm text-muted-foreground">Total Prompts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promptStats.total_exceptions}</p>
                <p className="text-sm text-muted-foreground">Exceptions Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Session Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Completion</CardTitle>
            <CardDescription>Number of learners who completed each session</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skill Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skill Level Distribution</CardTitle>
            <CardDescription>AI proficiency levels across learners</CardDescription>
          </CardHeader>
          <CardContent>
            {skillDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={skillDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {skillDistData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exception Types */}
      {Object.keys(promptStats.by_exception_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exception Types</CardTitle>
            <CardDescription>Types of flagged prompt exceptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(promptStats.by_exception_type).map(([type, count]) => (
                <Badge key={type} variant="outline" className="text-sm py-1 px-3 gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                  {type.replace('_', ' ')}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learner Progress</CardTitle>
          <CardDescription>Individual completion status for all learners</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No learners found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Role</th>
                    <th className="text-left py-2 px-3 font-medium">LOB</th>
                    <th className="text-center py-2 px-3 font-medium">Level</th>
                    <th className="text-center py-2 px-3 font-medium">S1</th>
                    <th className="text-center py-2 px-3 font-medium">S2</th>
                    <th className="text-center py-2 px-3 font-medium">S3</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProgress.map((user) => (
                    <tr key={user.user_id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{user.display_name || 'Unknown'}</td>
                      <td className="py-2 px-3 text-muted-foreground">{user.bank_role || '—'}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {LOB_LABELS[user.line_of_business || ''] || '—'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">{user.ai_proficiency_level ?? '—'}</td>
                      <td className="py-2 px-3 text-center">
                        {user.session_1_completed ? '✓' : '—'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {user.session_2_completed ? '✓' : '—'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {user.session_3_completed ? '✓' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
