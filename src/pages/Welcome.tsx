import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
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
              Personalized learning experiences tailored to your role and learning style.
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
              <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
              <p className="text-muted-foreground text-sm">
                Lessons adapted to your unique learning style—visual, procedural, or conceptual.
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
                Create real work artifacts—memos, analyses, and reports you can use immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}