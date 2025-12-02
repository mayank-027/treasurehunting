import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Mail, Lock, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type TeamPayload = {
  team: {
    id: string;
    name: string;
    email: string;
    startCode: string;
    currentRoundNumber: number;
    status: string;
  };
};

const TeamSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch<TeamPayload>("/teams/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      toast.success("Team registered successfully! Please log in to continue.");
      navigate("/team/login", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-elevated">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-2xl font-bold">Team Sign Up</h1>
              <p className="text-sm text-muted-foreground">
                Create your team account to join the treasure hunt
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="icon">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="e.g., Team Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email">Team Email</Label>
            <div className="mt-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="team@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="mt-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-accent hover:opacity-90 shadow-glow-accent"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign up"}
          </Button>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Already have a team account?{" "}
            <Link to="/team/login" className="underline">
              Log in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default TeamSignup;


