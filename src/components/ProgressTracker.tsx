import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  current: number;
  total: number;
}

const ProgressTracker = ({ current, total }: ProgressTrackerProps) => {
  const percentage = (current / total) * 100;

  return (
    <Card className="p-6 gradient-primary text-primary-foreground shadow-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <span className="text-lg font-semibold">Hunt Progress</span>
        </div>
        <span className="text-2xl font-bold">
          {current}/{total}
        </span>
      </div>
      
      <Progress value={percentage} className="h-3 bg-primary-foreground/20" />
      
      <div className="mt-2 text-sm opacity-90">
        Round {current} of {total} • {Math.round(percentage)}% Complete
      </div>
    </Card>
  );
};

export default ProgressTracker;