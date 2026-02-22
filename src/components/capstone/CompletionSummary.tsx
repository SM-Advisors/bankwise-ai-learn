import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy, CheckCircle, Sparkles, Award,
} from 'lucide-react';
import type { SkillSignal } from '@/types/progress';
import { aggregateSkillSignals } from '@/utils/deriveSkillSignals';

interface CompletionSummaryProps {
  userName: string;
  completedAt?: string;
  skillSignals: SkillSignal[];
  totalModulesCompleted: number;
  totalModules: number;
  onViewCertificate?: () => void;
}

export function CompletionSummary({
  userName,
  completedAt,
  skillSignals,
  totalModulesCompleted,
  totalModules,
  onViewCertificate,
}: CompletionSummaryProps) {
  const aggregated = aggregateSkillSignals(skillSignals);
  const proficientSkills = aggregated.filter(s => s.level === 'proficient');
  const developingSkills = aggregated.filter(s => s.level === 'developing');

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Program Complete!</h3>
              <Badge className="bg-amber-500/10 text-amber-700 border-amber-300 text-xs">
                <Award className="h-3 w-3 mr-1" />
                Certified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Congratulations, {userName}! You completed the AI Training Program on {formattedDate}.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="text-lg font-bold text-foreground">{totalModulesCompleted}</div>
                <div className="text-xs text-muted-foreground">Modules</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="text-lg font-bold text-foreground">{proficientSkills.length}</div>
                <div className="text-xs text-muted-foreground">Skills Mastered</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-white/5">
                <div className="text-lg font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>

            {/* Skills */}
            {proficientSkills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills Mastered</p>
                <div className="flex flex-wrap gap-1.5">
                  {proficientSkills.map((skill) => (
                    <Badge key={skill.skill} variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {skill.displayName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {developingSkills.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Developing</p>
                <div className="flex flex-wrap gap-1.5">
                  {developingSkills.slice(0, 4).map((skill) => (
                    <Badge key={skill.skill} variant="outline" className="text-xs gap-1 border-amber-500/30 text-amber-600">
                      <Sparkles className="h-3 w-3" />
                      {skill.displayName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {onViewCertificate && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={onViewCertificate}
              >
                <Award className="h-4 w-4" />
                View Certificate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
