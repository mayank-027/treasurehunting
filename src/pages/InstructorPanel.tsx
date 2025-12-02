import { Link } from "react-router-dom";
import { Home, Trophy, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type LeaderboardItem = {
  rank: number;
  teamName: string;
  currentRound: number;
  lastScanTime: string | null;
  totalTimeSeconds: number;
  status: string;
};

type UnlockItem = {
  round: number;
  code: string;
  status: "active" | "used" | "pending";
};

type StatsResponse = {
  totalRounds: number;
  activeTeams: number;
  completedHunts: number;
};

const InstructorPanel = () => {
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery<LeaderboardItem[]>({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch<LeaderboardItem[]>("/game/leaderboard"),
    refetchInterval: 5000,
  });

  const { data: unlockCodes = [], isLoading: loadingUnlocks } = useQuery<UnlockItem[]>({
    queryKey: ["unlock-codes"],
    queryFn: () => apiFetch<UnlockItem[]>("/game/unlock-codes"),
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ["game-stats-instructor"],
    queryFn: () => apiFetch<StatsResponse>("/game/stats"),
    refetchInterval: 5000,
  });

  const currentRound = leaderboard[0]?.currentRound ?? 0;
  const activeTeams = stats?.activeTeams ?? leaderboard.length;

  return (
    <div className="min-h-screen gradient-surface">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Instructor Panel</h1>
              <p className="text-sm text-muted-foreground">Live Game Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="gradient-primary text-primary-foreground animate-pulse-glow">
              <div className="w-2 h-2 rounded-full bg-current mr-2" />
              Live
            </Badge>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 gradient-primary text-primary-foreground shadow-glow">
            <Users className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-sm opacity-90">Active Teams</div>
            <div className="text-3xl font-bold">
              {loadingLeaderboard ? "…" : activeTeams}
            </div>
          </Card>
          
          <Card className="p-6 gradient-accent text-accent-foreground shadow-glow-accent">
            <Trophy className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-sm opacity-90">Leading Round</div>
            <div className="text-3xl font-bold">
              {loadingLeaderboard ? "…" : currentRound || "-"}
            </div>
          </Card>
          
          <Card className="p-6 bg-card shadow-elevated">
            <Clock className="w-8 h-8 mb-2 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Completed Hunts</div>
            <div className="text-3xl font-bold text-success">
              {stats?.completedHunts ?? 0}
            </div>
          </Card>

          <Card className="p-6 bg-card shadow-elevated">
            <div className="text-sm text-muted-foreground">Total Rounds</div>
            <div className="text-3xl font-bold">{stats?.totalRounds ?? "-"}</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-elevated">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Live Leaderboard</h2>
              </div>
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead className="text-center">Round</TableHead>
                      <TableHead>Last Scan</TableHead>
                      <TableHead>Total Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLeaderboard && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Loading leaderboard...
                        </TableCell>
                      </TableRow>
                    )}
                    {!loadingLeaderboard && leaderboard.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No teams yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {leaderboard.map((team) => (
                      <TableRow key={team.rank}>
                        <TableCell>
                          <Badge
                            variant={team.rank === 1 ? "default" : "outline"}
                            className={team.rank === 1 ? "gradient-accent text-accent-foreground" : ""}
                          >
                            #{team.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{team.teamName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{team.currentRound}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {team.lastScanTime
                            ? new Date(team.lastScanTime).toLocaleTimeString()
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {team.totalTimeSeconds
                            ? `${Math.round(team.totalTimeSeconds / 60)} min`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          <div>
            <Card className="shadow-elevated">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Unlock Codes</h2>
              </div>
              <div className="p-6 space-y-3">
                {loadingUnlocks && (
                  <p className="text-sm text-muted-foreground">Loading unlock codes...</p>
                )}
                {!loadingUnlocks && unlockCodes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No rounds configured yet.</p>
                )}
                {unlockCodes.map((item) => (
                  <div
                    key={item.round}
                    className={`p-4 rounded-lg border-2 ${
                      item.status === "active"
                        ? "border-accent bg-accent/10"
                        : item.status === "used"
                        ? "border-muted bg-muted/50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Round {item.round}</span>
                      <Badge
                        variant={
                          item.status === "active"
                            ? "default"
                            : item.status === "used"
                            ? "secondary"
                            : "outline"
                        }
                        className={item.status === "active" ? "gradient-accent text-accent-foreground" : ""}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="font-mono text-lg font-bold">{item.code}</div>
                    {item.status === "active" && (
                      <Button size="sm" className="w-full mt-2 gradient-accent hover:opacity-90">
                        Broadcast Code
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPanel;