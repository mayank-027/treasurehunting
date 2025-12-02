import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, List, Home, Trophy, LogOut, KeyRound, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type StatsResponse = {
  totalRounds: number;
  activeTeams: number;
  completedHunts: number;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch<StatsResponse>("/game/stats"),
  });

  const stats = data ?? {
    totalRounds: 0,
    activeTeams: 0,
    completedHunts: 0,
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 gradient-primary text-primary-foreground shadow-glow">
            <div className="text-sm opacity-90 mb-1">Total Rounds</div>
            <div className="text-4xl font-bold">
              {isLoading ? "…" : stats.totalRounds}
            </div>
          </Card>
          <Card className="p-6 gradient-accent text-accent-foreground shadow-glow-accent">
            <div className="text-sm opacity-90 mb-1">Active Teams</div>
            <div className="text-4xl font-bold">
              {isLoading ? "…" : stats.activeTeams}
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-elevated">
            <div className="text-sm text-muted-foreground mb-1">Completed Hunts</div>
            <div className="text-4xl font-bold text-success">
              {isLoading ? "…" : stats.completedHunts}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 hover:shadow-glow transition-all duration-300 border-2">
            <Plus className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Create New Round</h2>
            <p className="text-muted-foreground mb-6">
              Add a new treasure hunt round with clues, QR codes, and unlock codes
            </p>
            <Link to="/admin/create-round">
              <Button className="gradient-primary hover:opacity-90 shadow-glow">
                Create Round
              </Button>
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-elevated transition-all duration-300 border-2">
            <List className="w-12 h-12 text-accent mb-4" />
            <h2 className="text-2xl font-bold mb-2">Manage Rounds</h2>
            <p className="text-muted-foreground mb-6">
              View, edit, and download QR codes for existing rounds
            </p>
            <Link to="/admin/manage-rounds">
              <Button variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                View All Rounds
              </Button>
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-elevated transition-all duration-300 border-2">
            <KeyRound className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assign Clues & Codes</h2>
            <p className="text-muted-foreground mb-6">
              Create unique unlock codes per round and assign them to specific teams
            </p>
            <Link to="/admin/assign-clues">
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Manage Assignments
              </Button>
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-elevated transition-all duration-300 border-2">
            <Lightbulb className="w-12 h-12 text-accent mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hint Requests</h2>
            <p className="text-muted-foreground mb-6">
              Review and approve/reject hint requests from teams
            </p>
            <Link to="/admin/hint-requests">
              <Button variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Manage Requests
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;