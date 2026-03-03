import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ViewAsBanner } from "@/components/ViewAsBanner";
import { AppShell } from "@/components/shell";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import TrainingWorkspace from "./pages/TrainingWorkspace";
import Questionnaire from "./pages/Questionnaire";
import TopicSelection from "./pages/TopicSelection";
import Lesson from "./pages/Lesson";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Ideas from "./pages/Ideas";
import Policies from "./pages/Policies";
import PolicyDetail from "./pages/PolicyDetail";
import Settings from "./pages/Settings";
import AIMemories from "./pages/AIMemories";
import ResetPassword from "./pages/ResetPassword";
import PromptLibrary from "./pages/PromptLibrary";
import Electives from "./pages/Electives";
import ElectiveWorkspace from "./pages/ElectiveWorkspace";
import Certificates from "./pages/Certificates";
import AIJourney from "./pages/AIJourney";
import NotFound from "./pages/NotFound";
import ShellPreview from "./pages/ShellPreview";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TrainingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SessionProvider>
                <ViewAsBanner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Onboarding — pre-shell, no AppShell */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } />

                  {/* Dashboard — wraps itself in AppShell (needs dynamic topBarActions) */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute requireOnboarding>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  {/* Training — focus mode, full-screen, no AppShell */}
                  <Route path="/training/:sessionId" element={
                    <ProtectedRoute requireOnboarding>
                      <TrainingWorkspace />
                    </ProtectedRoute>
                  } />
                  <Route path="/training/elective" element={
                    <ProtectedRoute requireOnboarding>
                      <ElectiveWorkspace />
                    </ProtectedRoute>
                  } />

                  {/* Learner routes — AppShell with breadcrumbs */}
                  <Route path="/ideas" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'My Ideas' },
                      ]}>
                        <Ideas />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/policies" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Bank Policies' },
                      ]}>
                        <Policies />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/policies/:id" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Bank Policies', path: '/policies' },
                        { label: 'Policy' },
                      ]}>
                        <PolicyDetail />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Settings' },
                      ]}>
                        <Settings />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/memories" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'AI Memories' },
                      ]}>
                        <AIMemories />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/prompts" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Prompt Library' },
                      ]}>
                        <PromptLibrary />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/electives" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Elective Paths' },
                      ]}>
                        <Electives />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/certificates" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Certificates' },
                      ]}>
                        <Certificates />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/journey" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'My AI Journey' },
                      ]}>
                        <AIJourney />
                      </AppShell>
                    </ProtectedRoute>
                  } />

                  {/* Legacy training flow — removed LegacyLayout, bare routes */}
                  <Route path="/questionnaire" element={
                    <ProtectedRoute requireOnboarding>
                      <Questionnaire />
                    </ProtectedRoute>
                  } />
                  <Route path="/topics" element={
                    <ProtectedRoute requireOnboarding>
                      <TopicSelection />
                    </ProtectedRoute>
                  } />
                  <Route path="/lesson" element={
                    <ProtectedRoute requireOnboarding>
                      <Lesson />
                    </ProtectedRoute>
                  } />

                  {/* Admin — no AppShell for now */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin" element={
                    <ProtectedRoute requireOnboarding>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Phase 0 — Shell preview (dev/QA only) */}
                  <Route path="/shell-preview" element={
                    <ProtectedRoute requireOnboarding>
                      <ShellPreview />
                    </ProtectedRoute>
                  } />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SessionProvider>
            </BrowserRouter>
          </TrainingProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
