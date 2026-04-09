import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Award, Lock, Printer, Loader2, Eye } from 'lucide-react';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import type { SessionProgressData } from '@/types/progress';

const SESSION_LABELS: Record<number, { title: string; skills: string[] }> = {
  1: {
    title: 'AI Fundamentals & Your First Win',
    skills: ['Basic Interaction', 'Flipped Interaction Pattern', 'Iteration', 'Self-Review Loops'],
  },
  2: {
    title: 'Prompting Frameworks & Model Selection',
    skills: ['CLEAR Framework', 'Output Templating', 'Multi-Shot Prompting', 'Chain-of-Thought', 'Model & Tool Selection'],
  },
  3: {
    title: 'Skills & Projects',
    skills: ['Autonomy Spectrum', 'Skill Anatomy', 'Knowledge Integration', 'Skills + Projects', 'Sharing & Scaling'],
  },
  4: {
    title: 'Agents & Autonomy',
    skills: ['Agent Design', 'Agent Building & Testing', 'Governance & Compliance', 'Agent Deployment'],
  },
  5: {
    title: 'AI in Your Everyday Tools',
    skills: ['AI in Spreadsheets', 'AI in Presentations', 'AI in Email', 'Workflow Integration'],
  },
  6: {
    title: 'Designing Your AI Workflow',
    skills: ['Stack Mapping', 'Workflow Design', 'Prototype Building', 'Presentation & Reflection'],
  },
};

export default function Certificates() {
  const navigate = useNavigate();
  const { profile, progress, loading } = useAuth();
  const [previewSession, setPreviewSession] = useState<number | null>(null);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const prog = progress as unknown as Record<string, unknown>;

  const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number).filter((id) => id > 0);

  const getSessionProgressData = (sessionId: number): SessionProgressData | null => {
    if (!progress) return null;
    const key = `session_${sessionId}_progress`;
    return (prog[key] as SessionProgressData) || null;
  };

  const handlePrint = (sessionId: number) => {
    const label = SESSION_LABELS[sessionId];
    const data = getSessionProgressData(sessionId);
    const completedAt = data?.capstoneData?.completedAt || new Date().toISOString();
    const userName = profile.display_name || 'Learner';
    const bankName = profile.employer_name || '';
    const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - Session ${sessionId} - ${userName}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: Georgia, 'Times New Roman', serif; }
          .cert { width: 10in; height: 7.5in; border: 3px solid #B8860B; padding: 40px; box-sizing: border-box; position: relative; background: white; }
          .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #DAA520; pointer-events: none; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 28px; color: #1a1a1a; margin: 0; letter-spacing: 3px; text-transform: uppercase; }
          .header .sub { font-size: 14px; color: #666; margin-top: 8px; letter-spacing: 2px; }
          .icon { text-align: center; margin: 12px 0; }
          .icon svg { width: 40px; height: 40px; color: #DAA520; }
          .body { text-align: center; margin: 20px 0; }
          .presented { font-size: 14px; color: #666; margin-bottom: 8px; }
          .name { font-size: 32px; font-weight: bold; color: #1a1a1a; margin: 6px 0; border-bottom: 2px solid #DAA520; display: inline-block; padding-bottom: 4px; }
          .bank { font-size: 15px; color: #444; margin-top: 6px; }
          .session-title { font-size: 18px; color: #333; font-weight: bold; margin-top: 16px; }
          .desc { font-size: 13px; color: #555; max-width: 580px; margin: 16px auto; line-height: 1.5; }
          .skills { text-align: center; margin: 16px 0; }
          .skills span { display: inline-block; background: #f5f0e0; color: #8B7500; padding: 4px 14px; border-radius: 20px; font-size: 11px; margin: 3px; border: 1px solid #DAA520; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; }
          .footer .date { font-size: 12px; color: #666; }
          .footer .sig { text-align: center; }
          .footer .sig .line { width: 180px; border-top: 1px solid #999; margin-bottom: 4px; }
          .footer .sig .label { font-size: 11px; color: #666; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="header">
            <h1>Certificate of Completion</h1>
            <div class="sub">SMILE AI Training Program &mdash; Session ${sessionId}</div>
          </div>
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <div class="body">
            <div class="presented">This certificate is proudly presented to</div>
            <div class="name">${userName}</div>
            ${bankName ? `<div class="bank">${bankName}</div>` : ''}
            <div class="session-title">Session ${sessionId}: ${label?.title || ''}</div>
          </div>
          <div class="desc">
            For successfully completing Session ${sessionId} of the SMILE AI Training Program, demonstrating proficiency in the skills below.
          </div>
          <div class="skills">
            ${(label?.skills || []).map((s) => `<span>${s}</span>`).join('')}
          </div>
          <div class="footer">
            <div class="date">Completed: ${formattedDate}</div>
            <div class="sig">
              <div class="line"></div>
              <div class="label">SMILE Program Director</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {sessionIds.map((sessionId) => {
            const isCompleted = !!prog[`session_${sessionId}_completed`];
            const isAccessible = sessionId === 1 || !!prog[`session_${sessionId - 1}_completed`];
            const label = SESSION_LABELS[sessionId];
            const data = getSessionProgressData(sessionId);
            const completedAt = data?.capstoneData?.completedAt;

            return (
              <Card key={sessionId} className={`transition-all ${isCompleted ? 'hover:shadow-lg' : 'opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      isCompleted
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
                        : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <Award className="h-6 w-6 text-amber-600" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    {isCompleted ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                        Earned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">
                    Session {sessionId}: {label?.title}
                  </CardTitle>
                  <CardDescription>
                    {isCompleted && completedAt
                      ? `Completed ${new Date(completedAt).toLocaleDateString()}`
                      : `Complete all ${ALL_SESSION_CONTENT[sessionId]?.modules?.length || ''} modules in Session ${sessionId} to earn this certificate`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {label?.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className={`text-[10px] ${
                        isCompleted ? 'border-amber-500/30 text-amber-700' : ''
                      }`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {isCompleted ? (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2" onClick={() => setPreviewSession(sessionId)}>
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button className="flex-1 gap-2" onClick={() => handlePrint(sessionId)}>
                        <Printer className="h-4 w-4" />
                        Print / PDF
                      </Button>
                    </div>
                  ) : isAccessible ? (
                    <Button className="w-full gap-2" variant="outline" onClick={() => navigate(`/training/${sessionId}`)}>
                      Go to Session {sessionId}
                    </Button>
                  ) : (
                    <Button className="w-full gap-2" variant="outline" disabled>
                      <Lock className="h-4 w-4" />
                      Complete previous session to unlock
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Certificate Preview Dialog */}
      <Dialog open={previewSession !== null} onOpenChange={(open) => !open && setPreviewSession(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {previewSession && (() => {
            const label = SESSION_LABELS[previewSession];
            const data = getSessionProgressData(previewSession);
            const completedAt = data?.capstoneData?.completedAt || new Date().toISOString();
            const userName = profile.display_name || 'Learner';
            const bankName = profile.employer_name || '';
            const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            });
            return (
              <div className="border-2 border-amber-500/50 rounded-lg p-6 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background">
                <div className="text-center space-y-3">
                  <Award className="h-10 w-10 text-amber-600 mx-auto" />
                  <h3 className="text-sm font-semibold uppercase tracking-[3px] text-foreground">Certificate of Completion</h3>
                  <p className="text-xs text-muted-foreground">SMILE AI Training Program — Session {previewSession}</p>
                  <div className="py-3">
                    <p className="text-xs text-muted-foreground">This certificate is proudly presented to</p>
                    <p className="text-2xl font-bold text-foreground mt-1 border-b-2 border-amber-500 inline-block pb-1">{userName}</p>
                    {bankName && <p className="text-sm text-muted-foreground mt-1">{bankName}</p>}
                  </div>
                  <p className="font-semibold text-foreground">Session {previewSession}: {label?.title}</p>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                    {label?.skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-400">{s}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">Completed: {formattedDate}</p>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewSession(null)}>Close</Button>
            <Button className="gap-2" onClick={() => { handlePrint(previewSession!); setPreviewSession(null); }}>
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
