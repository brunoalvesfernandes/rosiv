import { cn } from "@/lib/utils";
import { avatarOptions, getAvatarById } from "@/data/avatars";
import { Shield } from "lucide-react";

interface PixelAvatarProps {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevel?: boolean;
  level?: number;
  name?: string;
}

const sizeConfig = {
  sm: { width: 48, height: 48, clipSize: 100 },
  md: { width: 80, height: 80, clipSize: 120 },
  lg: { width: 128, height: 128, clipSize: 140 },
  xl: { width: 180, height: 180, clipSize: 180 },
};

// Position offsets for each character in the sprite sheets
const spritePositions: Record<string, { x: number; y: number; scale: number }> = {
  "warrior-1": { x: 0, y: 0, scale: 2.5 },
  "warrior-2": { x: -25, y: 0, scale: 2.5 },
  "warrior-3": { x: -50, y: 0, scale: 2.5 },
  "warrior-4": { x: -75, y: 0, scale: 2.5 },
  "mage-1": { x: 0, y: 0, scale: 2.2 },
  "mage-2": { x: -25, y: 0, scale: 2.2 },
  "mage-3": { x: -50, y: 0, scale: 2.2 },
  "mage-4": { x: -75, y: 0, scale: 2.2 },
};

export function PixelAvatar({ 
  avatarId, 
  size = "md", 
  className,
  showLevel = false,
  level = 1,
  name
}: PixelAvatarProps) {
  const avatar = getAvatarById(avatarId);
  const { width, height } = sizeConfig[size];
  const position = spritePositions[avatarId] || { x: 0, y: 0, scale: 2 };

  if (!avatar) {
    // Fallback to initials if avatar not found
    const initial = name?.charAt(0).toUpperCase() || "?";
    return (
      <div className={cn("relative", className)}>
        <div 
          style={{ width, height }}
          className="rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-display font-bold text-primary-foreground border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
        >
          <span style={{ fontSize: width * 0.4 }}>{initial}</span>
        </div>
        {showLevel && (
          <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border border-border">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded-full">
              <Shield className="w-3 h-3 text-gold" />
              <span className="text-xs font-bold text-gold">{level}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div 
        style={{ width, height }}
        className="rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] bg-gradient-to-br from-secondary to-card"
      >
        <div 
          className="w-full h-full overflow-hidden flex items-center justify-center"
          style={{
            imageRendering: "pixelated",
          }}
        >
          <img 
            src={avatar.image}
            alt={avatar.name}
            className="object-cover"
            style={{
              imageRendering: "pixelated",
              transform: `scale(${position.scale * (width / 100)}) translateX(${position.x}%)`,
              transformOrigin: "center center",
            }}
          />
        </div>
      </div>
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border border-border">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded-full">
            <Shield className="w-3 h-3 text-gold" />
            <span className="text-xs font-bold text-gold">{level}</span>
          </div>
        </div>
      )}
    </div>
  );
}
