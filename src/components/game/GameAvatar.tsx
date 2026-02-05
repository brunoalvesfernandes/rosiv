import { useCharacter, Character } from "@/hooks/useCharacter";
import { LayeredPixelAvatar } from "./LayeredPixelAvatar";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { useEquippedVipClothing } from "@/hooks/useVipClothing";
 import { deserializeCustomization, AvatarCustomization, defaultCustomization } from "@/data/avatarLayers";

interface GameAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLevel?: boolean;
  // Optional: pass character directly instead of fetching
  character?: Character | null;
}

const fallbackSizes = {
  sm: "w-12 h-12 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 text-4xl",
  xl: "w-40 h-40 text-5xl",
};

/**
 * GameAvatar - Automatically fetches character data and VIP clothing
 * Use this component when you want to show the current user's layered pixel avatar
 */
export function GameAvatar({ 
  size = "md", 
  className,
  showLevel = false,
  character: passedCharacter
}: GameAvatarProps) {
  const { data: fetchedCharacter, isLoading: charLoading } = useCharacter();
  const { data: vipClothing } = useEquippedVipClothing();
  
  const character = passedCharacter || fetchedCharacter;

   // Build customization, integrating VIP clothing items
   const getEnhancedCustomization = (): AvatarCustomization => {
     const base = character?.avatar_customization 
       ? deserializeCustomization(character.avatar_customization)
       : defaultCustomization;
     
     // Override with VIP clothing if equipped
     if (vipClothing?.hair) {
       base.hair = {
         ...base.hair,
         optionId: `vip-${vipClothing.hair.id}`,
       };
     }
     if (vipClothing?.shirt) {
       base.top = {
         ...base.top,
         optionId: `vip-${vipClothing.shirt.id}`,
       };
     }
     if (vipClothing?.pants) {
       base.bottom = {
         ...base.bottom,
         optionId: `vip-${vipClothing.pants.id}`,
       };
     }
     
     return base;
   };

  // Loading or no character - show placeholder  
  if (charLoading && !passedCharacter) {
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

  // Check if has any VIP items
  const hasVip = !!(vipClothing?.shirt || vipClothing?.pants || vipClothing?.hair);

   const enhancedCustomization = getEnhancedCustomization();

  return (
    <div className={cn("relative", className)}>
      <LayeredPixelAvatar
         customization={enhancedCustomization}
        size={size}
        showLevel={showLevel}
        level={character?.level || 1}
      />
      {hasVip && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-gold to-gold/80 rounded-full flex items-center justify-center border border-gold/50 shadow-lg z-10">
          <Crown className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
