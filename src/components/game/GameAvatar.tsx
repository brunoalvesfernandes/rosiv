import { useCharacter } from "@/hooks/useCharacter";
import { useEquippedVipClothing } from "@/hooks/useVipClothing";
import { VisualAvatar, VipClothingDisplay } from "./VisualAvatar";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface GameAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevel?: boolean;
}

const fallbackSizes = {
  sm: "w-12 h-12 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 text-4xl",
  xl: "w-40 h-40 text-5xl",
};

/**
 * GameAvatar - Automatically fetches character data and VIP clothing
 * Use this component when you want to show the current user's avatar with all VIP items
 */
export function GameAvatar({ 
  size = "md", 
  className,
  showLevel = false 
}: GameAvatarProps) {
  const { data: character, isLoading: charLoading } = useCharacter();
  const { data: vipClothing, isLoading: vipLoading } = useEquippedVipClothing();

  // Loading or no character - show placeholder
  if (charLoading || vipLoading || !character) {
    const initial = character?.name?.charAt(0).toUpperCase() || "?";
    return (
      <div className={cn("relative", className)}>
        <div 
          className={cn(
            "rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-display font-bold text-primary-foreground border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] animate-pulse",
            fallbackSizes[size]
          )}
        >
          {initial}
        </div>
      </div>
    );
  }

  // Convert vipClothing to VipClothingDisplay format
  const vipDisplay: VipClothingDisplay | null = vipClothing ? {
    shirt: vipClothing.shirt ? { image_url: vipClothing.shirt.image_url, name: vipClothing.shirt.name } : null,
    pants: vipClothing.pants ? { image_url: vipClothing.pants.image_url, name: vipClothing.pants.name } : null,
    hair: vipClothing.hair ? { image_url: vipClothing.hair.image_url, name: vipClothing.hair.name } : null,
  } : null;

  return (
    <VisualAvatar
      customization={{
        hairStyle: character.hair_style,
        hairColor: character.hair_color,
        eyeColor: character.eye_color,
        skinTone: character.skin_tone,
        faceStyle: character.face_style,
        accessory: character.accessory,
        shirtColor: character.shirt_color,
        pantsColor: character.pants_color,
        shoesColor: character.shoes_color,
      }}
      size={size}
      className={className}
      showLevel={showLevel}
      level={character.level}
      vipClothing={vipDisplay}
    />
  );
}
