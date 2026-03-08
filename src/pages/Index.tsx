import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, ClipboardCheck, ArrowRight, ShieldCheck, Settings, LogIn } from 'lucide-react';
import andreaCoach from '@/assets/andrea-coach.png';
import { Logo } from '@/components/Logo';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // If logged in and onboarding completed, redirect to dashboard
    if (!loading && user && profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  const handleStartJourney = () => {
    if (user) {
      if (profile?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="h-screen overflow-hidden gradient-hero relative flex flex-col">
      {/* Top Navigation */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            Dashboard
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        )}
        {profile?.is_super_admin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Button>
        )}
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl mx-auto text-center w-full">
          {/* Hero Section */}
          <div className="animate-fade-in mb-6">
            <div className="flex justify-center mb-4">
              <Logo variant="full" size="lg" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
              Transform Your Team with{' '}
              <span className="text-accent">AI Enablement</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-5 max-w-2xl mx-auto">
              Personalized learning experiences tailored to your role and interaction preferences.
              Practical, job-ready AI skills for your organization.
            </p>

            <Button
              size="lg"
              onClick={handleStartJourney}
              className="text-base px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {user ? 'Continue Learning' : 'Start Your Learning Journey'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card rounded-xl border shadow-sm p-4 text-left">
              <div className="p-2 rounded-lg bg-secondary inline-block mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Adaptive Delivery</h3>
              <p className="text-muted-foreground text-xs">
                Lessons adapted to your interaction preference—examples first, step-by-step, hands-on, or logic-based.
              </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-4 text-left">
              <div className="p-1 rounded-lg bg-secondary inline-block mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={andreaCoach} alt="Andrea - AI Coach" className="object-cover" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="font-semibold text-sm mb-1">Personalized Training</h3>
              <p className="text-muted-foreground text-xs">
                Content tailored to your role, department, and professional context from day one.
              </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-4 text-left">
              <div className="p-2 rounded-lg bg-secondary inline-block mb-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">Practical Outputs</h3>
              <p className="text-muted-foreground text-xs">
                Create real work artifacts—credit memos, analyses, and reports you can use immediately.
              </p>
            </div>
          </div>

          {/* Compliance Note */}
          <div className="mt-4 p-4 bg-card rounded-xl border text-left animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <ShieldCheck className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-0.5">Same Standards, Different Delivery</h4>
                <p className="text-xs text-muted-foreground">
                  Your interaction preferences change how training is delivered, not what is taught. All learners are trained to the same behaviors, compliance requirements, and success criteria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
