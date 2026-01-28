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
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  BookOpen,
  Bot,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  tips: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Dashboard Overview',
    description: 'Your dashboard is the central hub for tracking your AI training progress. Here you can see your learning track, overall completion percentage, and access each training session.',
    icon: LayoutDashboard,
    tips: [
      'Your progress is automatically saved as you complete modules',
      'Sessions unlock sequentially - complete one to access the next',
      'Your learning style badge shows how content is personalized for you',
    ],
  },
  {
    title: 'Training Sessions',
    description: 'The platform has three main training sessions that build on each other: AI Prompting & Personalization, Building Your AI Agent, and Role-Specific Training.',
    icon: GraduationCap,
    tips: [
      'Session 1 teaches foundational AI prompting skills',
      'Session 2 helps you create a custom AI agent for your role',
      'Session 3 provides training specific to your department',
    ],
  },
  {
    title: 'Training Workspace',
    description: 'When you start a session, you\'ll enter the three-column training workspace. The left panel shows training modules, the center is your practice area, and the right panel is your AI trainer.',
    icon: BookOpen,
    tips: [
      'Click modules on the left to view their content and exercises',
      'The center area has clear tasks and lessons to complete',
      'Both side panels can be collapsed for more workspace',
    ],
  },
  {
    title: 'AI Practice Area',
    description: 'The center column is where you apply what you\'ve learned. Each module has specific tasks, examples, and exercises. Practice prompting, review AI responses, and build your skills.',
    icon: MessageSquare,
    tips: [
      'Read the lesson content before attempting the task',
      'Try different prompt variations to see how AI responds',
      'Your work is reviewed by the AI trainer for feedback',
    ],
  },
  {
    title: 'AI Training Coach',
    description: 'The AI trainer in the right panel is your personal coach. It can answer questions about the current lesson, review your progress, provide feedback on your work, and offer suggestions.',
    icon: Bot,
    tips: [
      'Ask questions about concepts you don\'t understand',
      'Request feedback on your practice prompts',
      'Ask for examples related to your specific role',
    ],
  },
  {
    title: 'Administration & Resources',
    description: 'Access the Admin panel to view all training programs, learning styles, and curriculum content. Bank resources provide policies and guidelines for compliant AI usage.',
    icon: Settings,
    tips: [
      'Admin panel shows all available training content',
      'Review AI usage policies before applying skills at work',
      'Bank resources include compliance guidelines',
    ],
  },
];

interface HelpTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpTour({ open, onOpenChange }: HelpTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
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
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-primary" />
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
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
