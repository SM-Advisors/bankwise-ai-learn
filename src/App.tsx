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
import Ideas from "./pages/Ideas";
import ResetPassword from "./pages/ResetPassword";
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
