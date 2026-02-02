import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, Coins, Star, Swords, Zap } from "lucide-react";

interface MissionCardProps {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "boss";
  xpReward: number;
  goldReward: number;
  duration: number; // in minutes
  isActive?: boolean;
  isCompleted?: boolean;
  onAccept?: () => void;
  className?: string;
}

const difficultyConfig = {
  easy: {
    label: "Fácil",
    color: "text-success border-success/30 bg-success/10",
    icon: Star,
  },
  medium: {
    label: "Médio",
    color: "text-gold border-gold/30 bg-gold/10",
    icon: Zap,
  },
  hard: {
    label: "Difícil",
    color: "text-primary border-primary/30 bg-primary/10",
    icon: Swords,
  },
  boss: {
    label: "Boss",
    color: "text-xp border-xp/30 bg-xp/10",
    icon: Swords,
  },
};

export function MissionCard({
  title,
  description,
  difficulty,
  xpReward,
  goldReward,
  duration,
  isActive = false,
  isCompleted = false,
  onAccept,
  className,
}: MissionCardProps) {
  const config = difficultyConfig[difficulty];
  const DifficultyIcon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4 transition-all duration-300",
        isActive && "border-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
        isCompleted && "opacity-60",
        !isActive && !isCompleted && "border-border hover:border-primary/50",
        className
      )}
    >
      {/* Difficulty Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
            config.color
          )}
        >
          <DifficultyIcon className="w-3 h-3" />
          {config.label}
        </span>
        {isCompleted && (
          <span className="text-xs text-success font-medium">✓ Completa</span>
        )}
        {isActive && (
          <span className="text-xs text-primary font-medium animate-pulse">
            Em Progresso
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="font-display font-bold text-lg text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Rewards */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="w-4 h-4 text-xp" />
          <span className="text-xp font-medium">{xpReward} XP</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Coins className="w-4 h-4 text-gold" />
          <span className="text-gold font-medium">{goldReward}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{duration} min</span>
        </div>
      </div>

      {/* Action Button */}
      {!isCompleted && (
        <Button
          onClick={onAccept}
          variant={isActive ? "secondary" : "default"}
          className="w-full"
          disabled={isActive}
        >
          {isActive ? "Em Progresso..." : "Aceitar Missão"}
        </Button>
      )}
    </div>
  );
}
