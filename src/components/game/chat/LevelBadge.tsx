import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  // Color based on level ranges
  const getBadgeColor = () => {
    if (level >= 50) return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
    if (level >= 30) return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
    if (level >= 20) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    if (level >= 10) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[20px]",
        getBadgeColor(),
        className
      )}
      title={`Nível ${level}`}
    >
      {level}
    </span>
  );
}
