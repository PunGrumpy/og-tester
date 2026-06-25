import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

const getColors = (s: number) => {
  if (s >= 90) {
    return "bg-score-excellent/10 text-score-excellent border-score-excellent/20";
  }
  if (s >= 75) {
    return "bg-score-good/10 text-score-good border-score-good/20";
  }
  if (s >= 50) {
    return "bg-score-fair/10 text-score-fair border-score-fair/20";
  }
  return "bg-score-poor/10 text-score-poor border-score-poor/20";
};

export const ScoreBadge = ({ score, className }: ScoreBadgeProps) => (
  <Badge
    variant="outline"
    className={cn(
      "font-mono font-bold px-2 py-0.5 rounded text-xs border tabular-nums",
      getColors(score),
      className
    )}
  >
    {score}
  </Badge>
);
