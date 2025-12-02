import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2, QrCode, Play, Pause, Flag } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Round = {
  _id: string;
  roundNumber: number;
  clueText: string;
  qrId: string;
  unlockCode: string;
  createdAt: string;
  timerStatus?: "idle" | "running" | "paused" | "finished";
  timerStartAt?: string | null;
  accumulatedSeconds?: number;
};

const ManageRounds = () => {
  const queryClient = useQueryClient();
  const [now, setNow] = useState<Date>(() => new Date());

  // Tick local clock so we can show live timer without hammering the API
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading } = useQuery<Round[]>({
    queryKey: ["rounds"],
    queryFn: () => apiFetch<Round[]>("/rounds"),
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/rounds/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Round deleted");
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete round";
      toast.error(message);
    },
  });

  const timerMutation = useMutation({
    mutationFn: (params: { id: string; action: "start" | "pause" | "resume" | "finish" }) =>
      apiFetch<Round>(`/rounds/${params.id}/timer`, {
        method: "POST",
        body: JSON.stringify({ action: params.action }),
      }),
    onSuccess: (round) => {
      toast.success(`Timer ${round.timerStatus === "running" ? "updated" : "changed"}`);
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update timer";
      toast.error(message);
    },
  });

  const rounds = data ?? [];

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const computeElapsed = (round: Round) => {
    const base = round.accumulatedSeconds ?? 0;
    if (round.timerStatus === "running" && round.timerStartAt) {
      const started = new Date(round.timerStartAt).getTime();
      const extra = (now.getTime() - started) / 1000;
      return base + (extra > 0 ? extra : 0);
    }
    return base;
  };

  const handleDownloadQrInfo = (round: Round) => {
    const text = `Round ${round.roundNumber}\nQR ID: ${round.qrId}\nUnlock Code: ${round.unlockCode}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `round-${round.roundNumber}-qr-info.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Rounds</h1>
          <Link to="/admin/create-round">
            <Button className="gradient-primary hover:opacity-90 shadow-glow">
              Create New Round
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-muted-foreground">Loading rounds...</p>}
          {!isLoading && rounds.length === 0 && (
            <p className="text-muted-foreground">No rounds created yet.</p>
          )}
          {rounds.map((round) => (
            <Card
              key={round._id}
              className="p-6 hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="gradient-primary text-primary-foreground">
                      Round {round.roundNumber}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(round.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-lg mb-3">{round.clueText}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      <span className="font-mono text-muted-foreground">{round.qrId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Unlock:</span>
                      <Badge variant="outline" className="font-mono">{round.unlockCode}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Timer:</span>
                      <Badge variant="outline">
                        {formatDuration(computeElapsed(round))}
                      </Badge>
                      {round.timerStatus && (
                        <span className="text-xs uppercase text-muted-foreground">
                          {round.timerStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4 min-w-[160px]">
                  <div className="flex gap-2">
                    {round.timerStatus === "running" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => timerMutation.mutate({ id: round._id, action: "pause" })}
                        disabled={timerMutation.isPending}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    ) : round.timerStatus === "paused" || round.timerStatus === "idle" || !round.timerStatus ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => timerMutation.mutate({ id: round._id, action: "start" })}
                        disabled={timerMutation.isPending}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {round.timerStatus === "paused" ? "Restart" : "Start"}
                      </Button>
                    ) : null}

                    {round.timerStatus === "paused" || round.timerStatus === "running" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-accent"
                        onClick={() => timerMutation.mutate({ id: round._id, action: "finish" })}
                        disabled={timerMutation.isPending}
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        Finish
                      </Button>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>QR Code - Round {round.roundNumber}</DialogTitle>
                      </DialogHeader>
                      <QRCodeDisplay qrId={round.qrId} roundNumber={round.roundNumber} />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary"
                    onClick={() => handleDownloadQrInfo(round)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteMutation.mutate(round._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageRounds;