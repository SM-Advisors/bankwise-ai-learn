import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateGeneratorProps {
  userName: string;
  bankName: string;
  completedAt: string;
  onGenerated?: () => void;
}

export function CertificateGenerator({
  userName,
  bankName,
  completedAt,
  onGenerated,
}: CertificateGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    if (!certRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Unable to open print window',
        description: 'Please allow popups for this site and try again.',
        variant: 'destructive',
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Training Certificate - ${userName}</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: Georgia, 'Times New Roman', serif; }
          .cert { width: 10in; height: 7.5in; border: 3px solid #B8860B; padding: 40px; box-sizing: border-box; position: relative; background: white; }
          .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #DAA520; pointer-events: none; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { font-size: 32px; color: #1a1a1a; margin: 0; letter-spacing: 3px; text-transform: uppercase; }
          .header .sub { font-size: 14px; color: #666; margin-top: 8px; letter-spacing: 2px; }
          .icon { text-align: center; margin: 16px 0; }
          .icon svg { width: 48px; height: 48px; color: #DAA520; }
          .body { text-align: center; margin: 24px 0; }
          .presented { font-size: 14px; color: #666; margin-bottom: 12px; }
          .name { font-size: 36px; font-weight: bold; color: #1a1a1a; margin: 8px 0; border-bottom: 2px solid #DAA520; display: inline-block; padding-bottom: 4px; }
          .bank { font-size: 16px; color: #444; margin-top: 8px; }
          .desc { font-size: 14px; color: #555; max-width: 600px; margin: 24px auto; line-height: 1.6; }
          .skills { text-align: center; margin: 20px 0; }
          .skills span { display: inline-block; background: #f5f0e0; color: #8B7500; padding: 4px 16px; border-radius: 20px; font-size: 12px; margin: 4px; border: 1px solid #DAA520; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; }
          .footer .date { font-size: 13px; color: #666; }
          .footer .sig { text-align: center; }
          .footer .sig .line { width: 200px; border-top: 1px solid #999; margin-bottom: 4px; }
          .footer .sig .label { font-size: 12px; color: #666; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="header">
            <h1>Certificate of Completion</h1>
            <div class="sub">SMILE AI Training Program</div>
          </div>
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <div class="body">
            <div class="presented">This certificate is proudly presented to</div>
            <div class="name">${userName}</div>
            ${bankName ? `<div class="bank">${bankName}</div>` : ''}
          </div>
          <div class="desc">
            For successfully completing the comprehensive AI Training Program, demonstrating proficiency in structured prompting, AI agent development, and role-specific AI applications for professionals.
          </div>
          <div class="skills">
            <span>Foundation & Early Wins</span>
            <span>Structured Interaction</span>
            <span>Agent Building</span>
            <span>Functional AI Tools</span>
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
    setTimeout(() => {
      printWindow.print();
      onGenerated?.();
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Award className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-semibold text-foreground">Your Certificate</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Download your completion certificate for the SMILE AI Training Program.
        </p>

        <div className="flex gap-2 justify-center">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Certificate preview */}
      {showPreview && (
        <div ref={certRef} className="rounded-xl border-2 border-amber-600 bg-white p-8 space-y-4 text-center" style={{ fontFamily: 'Georgia, serif' }}>
          <h2 className="text-2xl font-bold text-gray-900 tracking-widest uppercase">Certificate of Completion</h2>
          <p className="text-sm text-gray-500 tracking-wider">SMILE AI Training Program</p>
          <Award className="h-10 w-10 text-amber-600 mx-auto" />
          <div>
            <p className="text-sm text-gray-500">This certificate is proudly presented to</p>
            <p className="text-3xl font-bold text-gray-900 mt-2 border-b-2 border-amber-500 inline-block pb-1">
              {userName}
            </p>
            {bankName && <p className="text-gray-600 mt-2">{bankName}</p>}
          </div>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            For successfully completing the comprehensive AI Training Program, demonstrating proficiency in structured prompting, AI agent development, and role-specific AI applications.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Foundation & Early Wins', 'Structured Interaction', 'Agent Building', 'Functional AI Tools'].map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 pt-2">Completed: {formattedDate}</p>
        </div>
      )}
    </div>
  );
}
