import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FeedbackButton } from "@/components/FeedbackButton";
import { ViewAsBanner } from "@/components/ViewAsBanner";


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

const queryClient = new QueryClient();

// Layout wrapper for legacy routes that need the header
const LegacyLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
  </div>
);

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
                <FeedbackButton />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected routes */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requireOnboarding>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/training/:sessionId" element={
                    <ProtectedRoute requireOnboarding>
                      <TrainingWorkspace />
                    </ProtectedRoute>
                  } />
                  <Route path="/ideas" element={
                    <ProtectedRoute requireOnboarding>
                      <Ideas />
                    </ProtectedRoute>
                  } />
                  <Route path="/policies" element={
                    <ProtectedRoute requireOnboarding>
                      <Policies />
                    </ProtectedRoute>
                  } />
                  <Route path="/policies/:id" element={
                    <ProtectedRoute requireOnboarding>
                      <PolicyDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requireOnboarding>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/memories" element={
                    <ProtectedRoute requireOnboarding>
                      <AIMemories />
                    </ProtectedRoute>
                  } />
                  <Route path="/prompts" element={
                    <ProtectedRoute requireOnboarding>
                      <PromptLibrary />
                    </ProtectedRoute>
                  } />
                  <Route path="/electives" element={
                    <ProtectedRoute requireOnboarding>
                      <Electives />
                    </ProtectedRoute>
                  } />
                  <Route path="/training/elective" element={
                    <ProtectedRoute requireOnboarding>
                      <ElectiveWorkspace />
                    </ProtectedRoute>
                  } />
                  <Route path="/certificates" element={
                    <ProtectedRoute requireOnboarding>
                      <Certificates />
                    </ProtectedRoute>
                  } />
                  <Route path="/journey" element={
                    <ProtectedRoute requireOnboarding>
                      <AIJourney />
                    </ProtectedRoute>
                  } />
                  {/* Legacy routes with header */}
                  <Route path="/questionnaire" element={
                    <ProtectedRoute requireOnboarding>
                      <LegacyLayout><Questionnaire /></LegacyLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/topics" element={
                    <ProtectedRoute requireOnboarding>
                      <LegacyLayout><TopicSelection /></LegacyLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/lesson" element={
                    <ProtectedRoute requireOnboarding>
                      <LegacyLayout><Lesson /></LegacyLayout>
                    </ProtectedRoute>
                  } />

                  {/* Admin */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireOnboarding>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Super Admin */}
                  <Route path="/super-admin" element={
                    <ProtectedRoute requireOnboarding>
                      <SuperAdminDashboard />
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
