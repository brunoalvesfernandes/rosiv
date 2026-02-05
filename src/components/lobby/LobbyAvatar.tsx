import { motion } from "framer-motion";
import { LayeredPixelAvatar } from "@/components/game/LayeredPixelAvatar";
import { deserializeCustomization, defaultCustomization } from "@/data/avatarLayers";
import { SpeechBubble } from "./SpeechBubble";
import { LobbyPlayer } from "@/hooks/useLobbyPresence";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LobbyAvatarProps {
  player: LobbyPlayer;
  isMe: boolean;
  onClick?: () => void;
  compact?: boolean;
}

// Get VIP hair style from name
function getVipHairStyle(hairName: string | null): string | null {
  if (!hairName) return null;
  const name = hairName.toLowerCase();
  if (name.includes("goku") || name.includes("saiyajin") || name.includes("ssj")) return "vip-goku-ssj";
  if (name.includes("sasuke") || name.includes("shippuden")) return "vip-sasuke";
  if (name.includes("akatsuki") || name.includes("itachi")) return "vip-akatsuki";
  return null;
}

export function LobbyAvatar({ player, isMe, onClick, compact = false }: LobbyAvatarProps) {
  const customization = player.odw_avatar_customization 
    ? deserializeCustomization(player.odw_avatar_customization)
    : defaultCustomization;

  // Apply VIP hair if present
  const vipHairStyle = getVipHairStyle(player.odw_vip_hair_name);
  if (vipHairStyle) {
    customization.hair = {
      ...customization.hair,
      optionId: vipHairStyle,
    };
  }

  const hasVip = !!(player.odw_vip_hair_name || player.odw_vip_shirt_name);

  return (
    <motion.div
      className="absolute cursor-pointer select-none z-10"
      style={{
        left: player.odw_x,
        top: player.odw_y,
        transform: "translate(-50%, -50%)",
      }}
      animate={{
        left: player.odw_x,
        top: player.odw_y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 20,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
    >
      {/* Speech Bubble */}
      <SpeechBubble 
        message={player.odw_last_message}
        timestamp={player.odw_message_timestamp}
        playerName={player.odw_name}
      />

      {/* Avatar Container */}
      <div className="relative flex flex-col items-center">
        {/* Glow for own player */}
        {isMe && (
          <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 blur-lg animate-pulse" />
        )}
        
        {/* Avatar */}
        <div className="relative">
          <LayeredPixelAvatar
            customization={customization}
            size={compact ? "sm" : "md"}
            variant="minimal"
          />
          
          {/* VIP Crown */}
          {hasVip && (
            <div className={cn(
              "absolute -top-1 -right-1 bg-gradient-to-br from-gold to-gold/80 rounded-full flex items-center justify-center shadow-lg",
              compact ? "w-3 h-3" : "w-4 h-4"
            )}>
              <Crown className={compact ? "w-2 h-2 text-primary-foreground" : "w-2.5 h-2.5 text-primary-foreground"} />
            </div>
          )}
        </div>

        {/* Name Tag */}
        <div className={cn(
          "mt-1 bg-background/80 backdrop-blur-sm rounded-full border border-border/50",
          compact ? "px-1.5 py-0.5" : "px-2 py-0.5"
        )}>
          <span className={cn(
            "font-medium",
            isMe ? "text-primary" : "text-foreground",
            compact ? "text-[9px]" : "text-xs"
          )}>
            {player.odw_name}
          </span>
          {!compact && (
            <span className="text-[10px] text-muted-foreground ml-1">
              Lv.{player.odw_level}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
