import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const CreateRound = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roundNumber: "",
    clueText: "",
    description: "",
    hint: "",
    unlockCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        roundNumber: Number(formData.roundNumber),
        clueText: formData.clueText,
        description: formData.description || undefined,
        hint: formData.hint || undefined,
        unlockCode: formData.unlockCode,
      };

      const round = await apiFetch<{ qrId: string; roundNumber: number }>("/rounds", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Round created successfully!", {
        description: `QR ID: ${round.qrId}`,
      });

      navigate("/admin/manage-rounds");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create round";
      toast.error(message);
    } finally {
      setLoading(false);
    }
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

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8 shadow-elevated">
          <div className="flex items-center gap-3 mb-6">
            <QrCode className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Create New Round</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="roundNumber">Round Number</Label>
              <Input
                id="roundNumber"
                type="number"
                placeholder="e.g., 1"
                value={formData.roundNumber}
                onChange={(e) => setFormData({ ...formData, roundNumber: e.target.value })}
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="clueText">Clue Text</Label>
              <Textarea
                id="clueText"
                placeholder="Enter the clue that teams will see..."
                value={formData.clueText}
                onChange={(e) => setFormData({ ...formData, clueText: e.target.value })}
                required
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional context or instructions..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="hint">Hint (Optional)</Label>
              <Input
                id="hint"
                placeholder="A helpful hint if teams get stuck"
                value={formData.hint}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="unlockCode">Unlock Code</Label>
              <Input
                id="unlockCode"
                placeholder="Code to unlock next round (e.g., TREASURE123)"
                value={formData.unlockCode}
                onChange={(e) => setFormData({ ...formData, unlockCode: e.target.value })}
                required
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This code will be shared by the instructor to unlock the next round
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 gradient-primary hover:opacity-90 shadow-glow"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Round"}
              </Button>
              <Link to="/admin" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        <Card className="mt-6 p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">📝 Note</h3>
          <p className="text-sm text-muted-foreground">
            A unique QR code will be automatically generated when you create this round. 
            You'll be able to download it from the Manage Rounds page.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CreateRound;