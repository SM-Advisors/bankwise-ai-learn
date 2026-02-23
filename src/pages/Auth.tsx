import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (profile?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate]);

  if (user) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(loginEmail);
    if (!emailResult.success) {
      toast({ title: 'Error', description: emailResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    
    const passwordResult = passwordSchema.safeParse(loginPassword);
    if (!passwordResult.success) {
      toast({ title: 'Error', description: passwordResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Switch storage based on Remember Me
    if (!rememberMe) {
      supabaseClient.auth.setSession; // no-op, we configure storage below
      // For "don't remember me", we clear localStorage after sign-in and rely on in-memory session
    }

    const { error } = await signIn(loginEmail, loginPassword);

    if (!error && !rememberMe) {
      // Remove persisted session so it doesn't survive browser close
      localStorage.removeItem('sb-tehcmmctcmmecuzytiec-auth-token');
    }

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      navigate('/onboarding');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const nameResult = nameSchema.safeParse(signupName);
    if (!nameResult.success) {
      toast({ title: 'Error', description: nameResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    if (!signupCode.trim()) {
      toast({ title: 'Error', description: 'Registration code is required', variant: 'destructive' });
      return;
    }

    const emailResult = emailSchema.safeParse(signupEmail);
    if (!emailResult.success) {
      toast({ title: 'Error', description: emailResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    const passwordResult = passwordSchema.safeParse(signupPassword);
    if (!passwordResult.success) {
      toast({ title: 'Error', description: passwordResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Validate registration code BEFORE creating the account
    const { data: codeResult, error: codeError } = await supabase.rpc(
      'validate_registration_code' as any,
      { input_code: signupCode }
    );

    if (codeError) {
      setIsLoading(false);
      toast({ title: 'Error', description: 'Unable to validate registration code. Please try again.', variant: 'destructive' });
      return;
    }

    const codeData = typeof codeResult === 'string' ? JSON.parse(codeResult) : codeResult;

    if (!codeData?.valid) {
      setIsLoading(false);
      toast({ title: 'Invalid Code', description: codeData?.error || 'Registration code is not valid.', variant: 'destructive' });
      return;
    }

    // Code is valid — create the account with organization assignment
    const { error } = await signUp(signupEmail, signupPassword, signupName, codeData.organization_id);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Account Exists',
          description: 'An account with this email already exists. Please log in instead.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
      }
    } else {
      // Store org_type so Onboarding can tailor the flow without an extra DB query
      if (codeData.org_type) {
        sessionStorage.setItem('signup_org_type', codeData.org_type);
      }
      toast({
        title: 'Account Created!',
        description: `Welcome to ${codeData.organization_name}. Let's set up your profile.`
      });
      navigate('/onboarding');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(resetEmail);
    if (!emailResult.success) {
      toast({ title: 'Error', description: emailResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setResetEmailSent(true);
      toast({ 
        title: 'Reset Email Sent', 
        description: 'Check your email for a password reset link.' 
      });
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo variant="full" size="lg" />
            </div>
            <CardTitle className="text-2xl font-display">Reset Password</CardTitle>
            <CardDescription>
              {resetEmailSent 
                ? 'Check your email for a password reset link'
                : 'Enter your email to receive a password reset link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetEmailSent ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <p className="text-sm text-green-600 font-medium">
                    Password reset email sent!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your inbox for a link to reset your password.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setResetEmail('');
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@bank.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send Reset Link
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full gap-2"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="full" size="lg" />
          </div>
          <CardDescription>
            Sign in to access your personalized AI enablement experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@bank.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jane Smith"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-code">Registration Code</Label>
                  <Input
                    id="signup-code"
                    type="text"
                    placeholder="Enter your organization code"
                    value={signupCode}
                    onChange={(e) => setSignupCode(e.target.value.toUpperCase())}
                    className="font-mono tracking-wider"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your organization administrator will provide this code
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@bank.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
