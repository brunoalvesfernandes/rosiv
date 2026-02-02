import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface CharacterAvatarProps {
  name: string;
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 text-4xl",
};

export function CharacterAvatar({ 
  name, 
  level, 
  className,
  size = "md" 
}: CharacterAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-display font-bold text-primary-foreground border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
          sizeClasses[size]
        )}
      >
        {initial}
      </div>
      <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border border-border">
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded-full">
          <Shield className="w-3 h-3 text-gold" />
          <span className="text-xs font-bold text-gold">{level}</span>
        </div>
      </div>
    </div>
  );
}
