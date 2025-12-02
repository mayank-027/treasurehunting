import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2, QrCode } from "lucide-react";
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
};

const ManageRounds = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Round[]>({
    queryKey: ["rounds"],
    queryFn: () => apiFetch<Round[]>("/rounds"),
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

  const rounds = data ?? [];

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
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
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
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageRounds;