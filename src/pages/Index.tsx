import { Link } from "react-router-dom";
import { Trophy, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen gradient-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4">
            <Trophy className="w-20 h-20 text-primary mx-auto animate-pulse-glow" />
          </div>
          <h1 className="text-6xl font-bold mb-4 text-gradient-primary">
            Digital Treasure Hunt
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An immersive treasure hunt experience with QR codes, clues, and real-time tracking
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 animate-scale-in border-2">
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-3">Admin Panel</h2>
            <p className="text-muted-foreground mb-6">
              Create rounds, generate QR codes, and manage the treasure hunt
            </p>
            <Link to="/admin/login">
              <Button className="w-full gradient-primary hover:opacity-90 shadow-glow">
                Admin Login
              </Button>
            </Link>
          </Card>

          <Card className="p-8 text-center hover:shadow-glow-accent transition-all duration-300 animate-scale-in border-2" style={{ animationDelay: "0.1s" }}>
            <Users className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-bold mb-3">Team Portal</h2>
            <p className="text-muted-foreground mb-6">
              Sign up or log in as a team, solve clues, and scan QR codes to progress
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/team/signup">
                <Button className="w-full gradient-accent hover:opacity-90 shadow-glow-accent">
                  Team Sign Up
                </Button>
              </Link>
              <Link to="/team/login">
                <Button variant="outline" className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  Team Login
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 text-center hover:shadow-elevated transition-all duration-300 animate-scale-in border-2" style={{ animationDelay: "0.2s" }}>
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-3">Instructor View</h2>
            <p className="text-muted-foreground mb-6">
              Monitor progress, view leaderboard, and broadcast codes
            </p>
            <Link to="/instructor">
              <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Instructor Panel
              </Button>
            </Link>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-full shadow-elevated">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm font-medium">System Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
