import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  GraduationCap,
  Radio,
  MessageCircle,
  Shield,
  Bot,
  PartyPopper,
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to BankWise AI Training!',
    description: "Let's show you around the platform. This quick tour will highlight the key areas you'll use during your AI training journey.",
    icon: Sparkles,
    tips: [
      'This tour takes about 1 minute to complete',
      'You can skip at any time and replay later',
      'Each step highlights a key feature of the platform',
    ],
  },
  {
    title: 'Your Profile & Progress',
    description: 'The profile card at the top shows your name, role, department, and overall training progress. Track your completion percentage as you work through sessions.',
    icon: User,
    tips: [
      'Your progress is automatically saved as you complete modules',
      'Click the profile menu to edit your details or retake the intake form',
      'Your learning style badge shows how content is personalized for you',
    ],
  },
  {
    title: 'Training Sessions',
    description: 'Complete three progressive sessions to build your AI skills: Prompting & Personalization, Building Your AI Agent, and Role-Specific Training. Sessions unlock sequentially.',
    icon: GraduationCap,
    tips: [
      'Each session has multiple interactive modules with practice tasks',
      'Sessions unlock in order — complete one to access the next',
      'Content adapts to your learning style and department',
    ],
  },
  {
    title: 'Live Training Feed',
    description: 'Join live sessions with expert instructors. These are scheduled events where you can learn alongside your peers and ask questions in real time.',
    icon: Radio,
    tips: [
      'Upcoming sessions appear with date, time, and instructor info',
      'Click "Notify Me" to get a reminder before the session starts',
      'Check back regularly for new live training opportunities',
    ],
  },
  {
    title: 'Community Hub',
    description: 'Connect with fellow banking professionals. Share AI use cases, ask questions, and collaborate on best practices with your peers across the organization.',
    icon: MessageCircle,
    tips: [
      'Click "Join Community" to access the discussion space',
      'Share ideas and learn from others\' experiences',
      'Great place to get help when you\'re stuck on a concept',
    ],
  },
  {
    title: 'Bank Policies',
    description: "Access your institution's AI usage policies and guidelines. Review these before applying AI skills in your daily work to ensure compliance.",
    icon: Shield,
    tips: [
      'Click "Bank Policies" in the header to browse all policies',
      'Policies are searchable and filterable by type',
      'Review updated policies regularly as guidelines evolve',
    ],
  },
  {
    title: 'Your AI Coach — Andrea',
    description: 'During training sessions, Andrea is your personal AI coach. She answers questions, reviews your work, provides feedback, and guides you through exercises.',
    icon: Bot,
    tips: [
      'Andrea appears in the right panel during training sessions',
      'Ask her questions about concepts you don\'t understand',
      'She provides personalized feedback on your practice tasks',
    ],
  },
  {
    title: 'Tour Complete!',
    description: "You're all set to start your AI training journey. Begin with Session 1 to build your prompting foundation. You can replay this tour anytime from the profile menu.",
    icon: PartyPopper,
    tips: [
      'Start with Session 1: AI Prompting & Personalization',
      'Use the Help button or profile menu to replay this tour',
      'Your progress saves automatically — pick up where you left off',
    ],
  },
];

interface HelpTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function HelpTour({ open, onOpenChange, onComplete }: HelpTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      onOpenChange(false);
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onComplete?.();
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{step.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <h4 className="text-sm font-medium text-muted-foreground">Tips:</h4>
          <ul className="space-y-2">
            {step.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-2">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-primary'
                  : idx < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Skip Tour
            </Button>
            <Button onClick={handleNext} className="gap-1">
              {isLast ? 'Get Started!' : 'Next'}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
