import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CreateRound from "./pages/CreateRound";
import ManageRounds from "./pages/ManageRounds";
import AssignClues from "./pages/AssignClues";
import ManageHintRequests from "./pages/ManageHintRequests";
import TeamPortal from "./pages/TeamPortal";
import TeamLogin from "./pages/TeamLogin";
import TeamSignup from "./pages/TeamSignup";
import InstructorPanel from "./pages/InstructorPanel";
import NotFound from "./pages/NotFound";
import RequireAdmin from "./components/RequireAdmin";
import RequireTeam from "./components/RequireTeam";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={(
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/create-round"
            element={(
              <RequireAdmin>
                <CreateRound />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/manage-rounds"
            element={(
              <RequireAdmin>
                <ManageRounds />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/assign-clues"
            element={(
              <RequireAdmin>
                <AssignClues />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/hint-requests"
            element={(
              <RequireAdmin>
                <ManageHintRequests />
              </RequireAdmin>
            )}
          />
          <Route path="/team/login" element={<TeamLogin />} />
          <Route path="/team/signup" element={<TeamSignup />} />
          <Route
            path="/team"
            element={(
              <RequireTeam>
                <TeamPortal />
              </RequireTeam>
            )}
          />
          <Route path="/instructor" element={<InstructorPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
