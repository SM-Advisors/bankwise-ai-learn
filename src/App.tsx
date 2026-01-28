import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { Header } from "@/components/Header";

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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TrainingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training/:sessionId" element={<TrainingWorkspace />} />
              
              {/* Legacy routes with header */}
              <Route path="/questionnaire" element={<LegacyLayout><Questionnaire /></LegacyLayout>} />
              <Route path="/topics" element={<LegacyLayout><TopicSelection /></LegacyLayout>} />
              <Route path="/lesson" element={<LegacyLayout><Lesson /></LegacyLayout>} />
              
              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TrainingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
