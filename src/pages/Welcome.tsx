import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Sparkles, ArrowRight, ShieldCheck, Settings } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero relative">
      {/* Admin Dashboard Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Admin Dashboard
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero Section */}
          <div className="animate-fade-in mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Training for Banking Professionals
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Your Banking Skills with{' '}
              <span className="text-accent">AI Training</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Personalized learning experiences tailored to your role and interaction preferences.
              Practical, job-ready skills for community and regional bank professionals.
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/questionnaire')}
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Your Learning Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-xl border shadow-sm p-6 text-left">
              <div className="p-3 rounded-lg bg-secondary inline-block mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Adaptive Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Lessons adapted to your interaction preference—examples first, step-by-step, hands-on, or logic-based.
              </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6 text-left">
              <div className="p-3 rounded-lg bg-secondary inline-block mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Role-Specific Training</h3>
              <p className="text-muted-foreground text-sm">
                Content designed for Accounting, Credit, and Executive banking professionals.
              </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6 text-left">
              <div className="p-3 rounded-lg bg-secondary inline-block mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Practical Outputs</h3>
              <p className="text-muted-foreground text-sm">
                Create real work artifacts—credit memos, analyses, and reports you can use immediately.
              </p>
            </div>
          </div>

          {/* Compliance Note */}
          <div className="mt-12 p-6 bg-card rounded-xl border text-left animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <ShieldCheck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Same Standards, Different Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Your interaction preferences change how training is delivered, not what is taught. All learners are trained to the same behaviors, compliance requirements, and success criteria. Preferences are situational and may be adjusted based on demonstrated judgment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}