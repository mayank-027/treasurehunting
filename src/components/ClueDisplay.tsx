import { useState, useEffect } from "react";
import { Lightbulb, Info, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface ClueDisplayProps {
  clue: {
    roundNumber: number;
    text: string;
    description?: string;
  };
  teamId: string;
}

type HintRequestStatus = "none" | "pending" | "approved" | "rejected";

const ClueDisplay = ({ clue, teamId }: ClueDisplayProps) => {
  const [hintStatus, setHintStatus] = useState<HintRequestStatus>("none");
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetchHintStatus = async () => {
      if (!teamId || !clue.roundNumber) return;
      setLoading(true);
      try {
        const data = await apiFetch<{
          request: {
            id: string;
            status: string;
            requestedAt: string;
            reviewedAt?: string;
          } | null;
          hint: string | null;
        }>(`/hints/my-request?teamId=${teamId}&roundNumber=${clue.roundNumber}`);
        
        if (data.request) {
          setHintStatus(data.request.status as HintRequestStatus);
          if (data.hint) {
            setHint(data.hint);
          }
        } else {
          setHintStatus("none");
        }
      } catch (err) {
        console.error("Failed to fetch hint status:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchHintStatus();
    
    // Poll for updates every 5 seconds if status is pending
    const interval = hintStatus === "pending" 
      ? setInterval(fetchHintStatus, 5000)
      : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [teamId, clue.roundNumber, hintStatus]);

  const handleRequestHint = async () => {
    if (!teamId || !clue.roundNumber) return;
    setRequesting(true);
    try {
      await apiFetch("/hints/request", {
        method: "POST",
        body: JSON.stringify({
          teamId,
          roundNumber: clue.roundNumber,
        }),
      });
      setHintStatus("pending");
      toast.success("Hint request submitted! Waiting for admin approval.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request hint";
      toast.error(message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Card className="p-6 shadow-elevated border-2 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Badge className="gradient-primary text-primary-foreground">
          Round {clue.roundNumber}
        </Badge>
        <span className="text-sm text-muted-foreground">Your Clue</span>
      </div>
      
      <div className="mb-6">
        <p className="text-2xl font-semibold leading-relaxed">{clue.text}</p>
      </div>

      {clue.description && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">{clue.description}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <Button variant="outline" className="w-full" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        ) : hintStatus === "none" ? (
          <Button
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            onClick={handleRequestHint}
            disabled={requesting}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {requesting ? "Requesting..." : "Request Hint"}
          </Button>
        ) : hintStatus === "pending" ? (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-500">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                Hint Request Pending
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your hint request has been submitted. Waiting for admin approval...
            </p>
          </div>
        ) : hintStatus === "approved" && hint ? (
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                Hint Approved - Click to View
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 p-4 bg-accent/10 rounded-lg border-2 border-accent">
              <p className="text-sm">{hint}</p>
            </CollapsibleContent>
          </Collapsible>
        ) : hintStatus === "rejected" ? (
          <div className="space-y-3">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-500">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-200">
                  Hint Request Rejected
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your hint request was not approved. You can try requesting again.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={handleRequestHint}
              disabled={requesting}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {requesting ? "Requesting..." : "Request Hint Again"}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default ClueDisplay;