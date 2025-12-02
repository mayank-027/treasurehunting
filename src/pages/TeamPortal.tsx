import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Trophy, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ClueDisplay from "@/components/ClueDisplay";
import QRScanner from "@/components/QRScanner";
import ProgressTracker from "@/components/ProgressTracker";
import { apiFetch } from "@/lib/api";

type GameState = "start" | "playing" | "locked" | "finished";

type Round = {
  roundNumber: number;
  clueText: string;
  description?: string;
};

type StartResponse = {
  team: { id: string; name: string; currentRoundNumber: number };
  round: { roundNumber: number; clueText: string; description?: string };
  totalRounds: number;
};

type UnlockResponse = {
  message: string;
  team: { id: string; name: string; currentRoundNumber: number; status: string };
  nextRound: null | {
    roundNumber: number;
    clueText: string;
    description?: string;
  };
};

const TeamPortal = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("start");
  const [unlockCode, setUnlockCode] = useState("");
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [startCode, setStartCode] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [clue, setClue] = useState<Round | null>(null);
  const [loadingUnlock, setLoadingUnlock] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("teamSession");
    if (!raw) {
      navigate("/team/login", { replace: true });
      return;
    }
    try {
      const session = JSON.parse(raw) as {
        id: string;
        name: string;
        startCode: string;
      };
      setTeamId(session.id);
      setTeamName(session.name);
      setStartCode(session.startCode);
    } catch {
      localStorage.removeItem("teamSession");
      navigate("/team/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const startGame = async () => {
      if (!startCode || !teamId || gameState !== "start") return;
      try {
        const data = await apiFetch<StartResponse>("/game/start", {
          method: "POST",
          body: JSON.stringify({ startCode }),
        });

        setCurrentRound(data.round.roundNumber);
        setTotalRounds(data.totalRounds);
        setClue({
          roundNumber: data.round.roundNumber,
          clueText: data.round.clueText,
          description: data.round.description,
        });

        toast.success("Welcome to the treasure hunt!");
        setGameState("playing");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to start game";
        toast.error(message);
      }
    };

    void startGame();
  }, [startCode, teamId, gameState]);

  const handleLogout = () => {
    setLoggingOut(true);
    localStorage.removeItem("teamSession");
    navigate("/team/login", { replace: true });
  };

  const handleAfterQrSuccess = () => {
    toast.success("Correct location found!", {
      description: "Now wait for the instructor's unlock code to proceed.",
    });
    setGameState("locked");
  };

  const handleUnlock = async () => {
    if (!teamId || !unlockCode) return;
    setLoadingUnlock(true);

    try {
      const data = await apiFetch<UnlockResponse>("/game/unlock", {
        method: "POST",
        body: JSON.stringify({ teamId, unlockCode }),
      });

      toast.success(data.message);
      setUnlockCode("");

      if (data.nextRound) {
        setCurrentRound(data.nextRound.roundNumber);
        setClue({
          roundNumber: data.nextRound.roundNumber,
          clueText: data.nextRound.clueText,
          description: data.nextRound.description,
        });
        setGameState("playing");
      } else {
        setGameState("finished");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Incorrect unlock code";
      toast.error(message);
    } finally {
      setLoadingUnlock(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold">{teamName ?? "Team Portal"}</h1>
                {gameState !== "start" && (
                  <p className="text-sm text-muted-foreground">
                    Round {currentRound} of {totalRounds}
                  </p>
                )}
              </div>
            </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {gameState === "playing" && clue && teamId && (
          <div className="space-y-6 animate-fade-in">
            <ProgressTracker current={currentRound} total={totalRounds} />
            <ClueDisplay
              clue={{
                roundNumber: clue.roundNumber,
                text: clue.clueText,
                description: clue.description,
              }}
              teamId={teamId}
            />
            <QRScanner teamId={teamId} onSuccess={handleAfterQrSuccess} />
          </div>
        )}

        {gameState === "locked" && clue && teamId && (
          <div className="space-y-6 animate-fade-in">
            <ProgressTracker current={currentRound} total={totalRounds} />
            <ClueDisplay
              clue={{
                roundNumber: clue.roundNumber,
                text: clue.clueText,
                description: clue.description,
              }}
              teamId={teamId}
            />
            
            <Card className="p-8 text-center bg-accent/10 border-2 border-accent shadow-glow-accent">
              <Lock className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-3">Round Completed! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                Wait for the instructor to share the unlock code for the next round
              </p>
              
              <div className="max-w-md mx-auto">
                <Label htmlFor="unlockCode">Unlock Code</Label>
                <Input
                  id="unlockCode"
                  placeholder="Enter unlock code from instructor"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value)}
                  className="mt-2 mb-4 text-center text-lg"
                />
                <Button
                  onClick={handleUnlock}
                  className="w-full gradient-accent hover:opacity-90"
                  disabled={loadingUnlock}
                >
                  {loadingUnlock ? "Checking..." : "Unlock Next Round"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {gameState === "finished" && (
          <Card className="p-8 text-center bg-accent/10 border-2 border-accent shadow-glow-accent animate-scale-in">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h3 className="text-2xl font-bold mb-3">🎉 Congratulations!</h3>
            <p className="text-muted-foreground">
              Your team has completed all rounds of the treasure hunt.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamPortal;