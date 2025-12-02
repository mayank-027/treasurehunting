import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, KeyRound, Users, Trash2, Download, QrCode } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type Round = {
  _id: string;
  roundNumber: number;
};

type Team = {
  _id: string;
  name: string;
};

type ClueAssignment = {
  _id: string;
  roundNumber: number;
  clueText: string;
  description?: string;
  hint?: string;
  unlockCode: string;
  qrId: string;
  teamIds: string[];
  timeLimitSeconds: number;
  createdAt: string;
};

type AssignmentResult = {
  teamId: string;
  teamName: string;
  durationSeconds: number;
  qualified: boolean;
};

const QRCodeDialog = ({ assignment }: { assignment: ClueAssignment }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateQRCode = async () => {
    if (qrDataUrl) return; // Already generated
    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(assignment.qrId, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      toast.error("Failed to generate QR code");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !qrDataUrl) {
      generateQRCode();
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-code-round-${assignment.roundNumber}-${assignment.qrId}.png`;
    link.click();
    toast.success("QR code downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-primary"
          title="View & Download QR Code"
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - Round {assignment.roundNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrDataUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${assignment.qrId}`}
                  className="w-64 h-64"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-mono text-muted-foreground">
                  QR ID: {assignment.qrId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Students will scan this QR code to verify their location
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full gradient-primary hover:opacity-90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code Image
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssignmentResults = ({ assignmentId }: { assignmentId: string }) => {
  const { data, isLoading } = useQuery<AssignmentResult[]>({
    queryKey: ["clue-results", assignmentId],
    queryFn: () => apiFetch<AssignmentResult[]>(`/clues/${assignmentId}/results`),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <p className="text-[11px] text-muted-foreground mt-1">
        Loading results...
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground mt-1">
        No teams have completed this assignment yet.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <p className="text-[11px] font-semibold text-muted-foreground">
        Results (fastest first):
      </p>
      <ul className="space-y-0.5">
        {data.map((r, idx) => (
          <li key={r.teamId} className="text-[11px] text-muted-foreground">
            #{idx + 1} {r.teamName} – {Math.round(r.durationSeconds)}s{" "}
            {!r.qualified && <span className="text-destructive">(disqualified)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AssignClues = () => {
  const queryClient = useQueryClient();
  const [selectedRound, setSelectedRound] = useState<number | "">("");
  const [clueText, setClueText] = useState("");
  const [description, setDescription] = useState("");
  const [hint, setHint] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["rounds-basic"],
    queryFn: () => apiFetch<Round[]>("/rounds"),
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["teams-basic"],
    queryFn: () => apiFetch<Team[]>("/teams"),
  });

  const { data: assignments = [], isLoading } = useQuery<ClueAssignment[]>({
    queryKey: ["clues"],
    queryFn: () => apiFetch<ClueAssignment[]>("/clues"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<ClueAssignment>("/clues", {
        method: "POST",
        body: JSON.stringify({
          roundNumber: Number(selectedRound),
          clueText,
          description: description || undefined,
          hint: hint || undefined,
          unlockCode,
          timeLimitSeconds,
          teamIds: selectedTeams,
        }),
      }),
    onSuccess: () => {
      toast.success("Clue assignment created");
      queryClient.invalidateQueries({ queryKey: ["clues"] });
      setClueText("");
      setDescription("");
      setHint("");
      setUnlockCode("");
      setSelectedTeams([]);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to create assignment";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/clues/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Clue assignment deleted");
      queryClient.invalidateQueries({ queryKey: ["clues"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete assignment";
      toast.error(message);
    },
  });

  const toggleTeam = (id: string) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const teamsById = useMemo(
    () =>
      teams.reduce<Record<string, Team>>((acc, t) => {
        acc[t._id] = t;
        return acc;
      }, {}),
    [teams],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedRound ||
      !unlockCode ||
      !clueText ||
      !timeLimitSeconds ||
      selectedTeams.length === 0
    ) {
      toast.error(
        "Please fill all required fields, set a time limit, and select at least one team.",
      );
      return;
    }
    createMutation.mutate();
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

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
        <Card className="p-8 shadow-elevated">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Assign Clues & Unlock Codes</h1>
              <p className="text-sm text-muted-foreground">
                Create per-team unlock codes for each round.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="round">Round</Label>
              <select
                id="round"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedRound}
                onChange={(e) =>
                  setSelectedRound(e.target.value ? Number(e.target.value) : "")
                }
                required
              >
                <option value="">Select round</option>
                {rounds.map((r) => (
                  <option key={r._id} value={r.roundNumber}>
                    Round {r.roundNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="clueText">Clue Text</Label>
              <Textarea
                id="clueText"
                value={clueText}
                onChange={(e) => setClueText(e.target.value)}
                className="mt-2"
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="hint">Hint (optional)</Label>
              <Input
                id="hint"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="unlockCode">Unlock Code (unique)</Label>
              <Input
                id="unlockCode"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                className="mt-2 font-mono"
                placeholder="e.g., LIBRARY-ALPHA"
                required
              />
            </div>

            <div>
              <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                className="mt-2"
                placeholder="e.g., 600 for 10 minutes"
                required
              />
            </div>

            <div>
              <Label>Teams</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-md p-2 bg-card">
                {teams.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2">
                    No teams registered yet.
                  </p>
                )}
                {teams.map((team) => {
                  const selected = selectedTeams.includes(team._id);
                  return (
                    <button
                      type="button"
                      key={team._id}
                      onClick={() => toggleTeam(team._id)}
                      className={`text-left text-xs px-2 py-1 rounded-md border ${
                        selected
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <Users className="w-3 h-3 inline-block mr-1" />
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary hover:opacity-90 shadow-glow"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Create Assignment"}
            </Button>
          </form>
        </Card>

        <Card className="p-8 shadow-elevated">
          <h2 className="text-xl font-bold mb-4">Existing Assignments</h2>
          {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!isLoading && assignments.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No clue assignments created yet.
            </p>
          )}

          <div className="space-y-4 max-h-[32rem] overflow-auto mt-2">
            {assignments.map((a) => (
              <div
                key={a._id}
                className="border rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="gradient-primary text-primary-foreground">
                      Round {a.roundNumber}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {a.unlockCode}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{a.clueText}</p>
                  {a.hint && (
                    <p className="text-xs text-muted-foreground">Hint: {a.hint}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Time limit: {a.timeLimitSeconds} seconds
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.teamIds.map((id) => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {teamsById[id]?.name ?? "Unknown team"}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                    QR ID: {a.qrId}
                  </p>
                  <AssignmentResults assignmentId={a._id} />
                </div>
                <div className="flex gap-2">
                  <QRCodeDialog assignment={a} />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-primary"
                    onClick={() => {
                      const text = `Assignment - Round ${a.roundNumber}\nQR ID: ${a.qrId}\nUnlock Code: ${a.unlockCode}\nClue: ${a.clueText}\nTime Limit: ${a.timeLimitSeconds} seconds\nTeams: ${a.teamIds.map(id => teamsById[id]?.name ?? "Unknown").join(", ")}`;
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `assignment-round-${a.roundNumber}-info.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Download Assignment Info"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteMutation.mutate(a._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignClues;


