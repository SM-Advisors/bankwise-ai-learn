import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ViewAsBanner } from "@/components/ViewAsBanner";
import { AppShell } from "@/components/shell";
import { Loader2 } from "lucide-react";

// Pages (lazy-loaded for route-based code splitting)
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TrainingWorkspace = lazy(() => import("./pages/TrainingWorkspace"));
const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const TopicSelection = lazy(() => import("./pages/TopicSelection"));
const Lesson = lazy(() => import("./pages/Lesson"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const Ideas = lazy(() => import("./pages/Ideas"));
const Policies = lazy(() => import("./pages/Policies"));
const PolicyDetail = lazy(() => import("./pages/PolicyDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const AIMemories = lazy(() => import("./pages/AIMemories"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PromptLibrary = lazy(() => import("./pages/PromptLibrary"));
const Electives = lazy(() => import("./pages/Electives"));
const ElectiveWorkspace = lazy(() => import("./pages/ElectiveWorkspace"));
const Certificates = lazy(() => import("./pages/Certificates"));
const AIJourney = lazy(() => import("./pages/AIJourney"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ShellPreview = lazy(() => import("./pages/ShellPreview"));
const Explore = lazy(() => import("./pages/Explore"));
const CommunityZone = lazy(() => import("./pages/CommunityZone"));
const AgentsZone = lazy(() => import("./pages/AgentsZone"));
const SharedAgentChat = lazy(() => import("./pages/SharedAgentChat"));

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
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
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

                  {/* Profile zone hub */}
                  <Route path="/profile" element={
                    <ProtectedRoute requireOnboarding>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  {/* Profile zone sub-pages — redirect to Profile tabs */}
                  <Route path="/settings" element={<Navigate to="/profile?tab=personalization" replace />} />
                  <Route path="/memories" element={<Navigate to="/profile?tab=personalization" replace />} />
                  <Route path="/journey" element={<Navigate to="/profile?tab=journey" replace />} />
                  <Route path="/my-profile" element={<Navigate to="/profile?tab=my-profile" replace />} />

                  {/* Explore zone sub-pages */}
                  <Route path="/ideas" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Explore', path: '/explore' },
                        { label: 'My Ideas' },
                      ]}>
                        <Ideas />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/prompts" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Explore', path: '/explore' },
                        { label: 'Prompt Library' },
                      ]}>
                        <PromptLibrary />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/electives" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Explore', path: '/explore' },
                        { label: 'Elective Paths' },
                      ]}>
                        <Electives />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/certificates" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Explore', path: '/explore' },
                        { label: 'Certificates' },
                      ]}>
                        <Certificates />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  {/* /journey redirects handled above in profile zone */}

                  {/* Org resources — eventually moves to Community zone */}
                  <Route path="/policies" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Community', path: '/community' },
                        { label: 'Org Resources' },
                      ]}>
                        <Policies />
                      </AppShell>
                    </ProtectedRoute>
                  } />
                  <Route path="/policies/:id" element={
                    <ProtectedRoute requireOnboarding>
                      <AppShell breadcrumbs={[
                        { label: 'Community', path: '/community' },
                        { label: 'Org Resources', path: '/policies' },
                        { label: 'Resource' },
                      ]}>
                        <PolicyDetail />
                      </AppShell>
                    </ProtectedRoute>
                  } />

                  {/* Explore zone — hub for prompts, ideas, electives, journey */}
                  <Route path="/explore" element={
                    <ProtectedRoute requireOnboarding>
                      <Explore />
                    </ProtectedRoute>
                  } />

                  {/* Community zone */}
                  <Route path="/community" element={
                    <ProtectedRoute requireOnboarding>
                      <CommunityZone />
                    </ProtectedRoute>
                  } />

                  {/* Agents zone — unlocked after first agent deployment */}
                  <Route path="/agents" element={
                    <ProtectedRoute requireOnboarding>
                      <AgentsZone />
                    </ProtectedRoute>
                  } />

                  {/* Shared agent — accessible to any authenticated user via link */}
                  <Route path="/agent/:agentId" element={
                    <ProtectedRoute requireOnboarding>
                      <SharedAgentChat />
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
                </Suspense>
              </SessionProvider>
            </BrowserRouter>
          </TrainingProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
