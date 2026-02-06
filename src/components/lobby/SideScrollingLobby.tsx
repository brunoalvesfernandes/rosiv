import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SideScrollingWorld, WORLD_WIDTH, GROUND_Y_PERCENT, BUILDINGS } from "./SideScrollingWorld";
import { LobbyAvatar } from "./LobbyAvatar";
import { useLobbyPresence, LobbyPlayer } from "@/hooks/useLobbyPresence";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingChat } from "../game/FloatingChat";

interface SideScrollingLobbyProps {
  width: number;
  height: number;
  onClose?: () => void;
  isFullscreen?: boolean;
}

export function SideScrollingLobby({
  width,
  height,
  onClose,
  isFullscreen = false,
}: SideScrollingLobbyProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Player position in world coordinates
  const [targetX, setTargetX] = useState<number | null>(null);
  const [facingRight, setFacingRight] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  // Calculate ground Y from viewport height
  const groundY = height * GROUND_Y_PERCENT;

  // Initialize presence
  const { players, myPosition, updatePosition, myUserId } = useLobbyPresence();

  // Convert to world-based X coordinate
  const playerWorldX = myPosition.x;

  // Movement animation
  useEffect(() => {
    if (targetX === null) return;

    const speed = 4;
    const interval = setInterval(() => {
      const currentX = myPosition.x;
      const diff = targetX - currentX;
      
      if (Math.abs(diff) < speed) {
        updatePosition(targetX, groundY - 40);
        setTargetX(null);
        setIsMoving(false);
      } else {
        setFacingRight(diff > 0);
        setIsMoving(true);
        updatePosition(currentX + Math.sign(diff) * speed, groundY - 40);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [targetX, myPosition.x, groundY, updatePosition]);

  // Handle ground click - move to position
  const handleGroundClick = useCallback((worldX: number) => {
    // Clamp to world bounds
    const clampedX = Math.max(50, Math.min(WORLD_WIDTH - 50, worldX));
    setTargetX(clampedX);
  }, []);

  // Handle building click - navigate
  const handleLocationClick = useCallback((locationId: string) => {
    const routes: Record<string, string> = {
      shop: "/shop",
      crafting: "/crafting",
      mining: "/dashboard",
      arena: "/arena",
      dungeon: "/dungeons",
      guild: "/guilds",
      training: "/training",
      pets: "/pets",
    };

    const route = routes[locationId];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  // Calculate camera offset for converting world coords to screen coords
  const halfViewport = width / 2;
  let cameraX = playerWorldX - halfViewport;
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - width, cameraX));

  // Convert world X to screen X
  const worldToScreen = (worldX: number) => worldX - cameraX;

  // Create a "fake" player object for current player to reuse LobbyAvatar
  const currentPlayer: LobbyPlayer = {
    odw_uid: myUserId || "",
    odw_x: worldToScreen(playerWorldX),
    odw_y: groundY - 40,
    odw_name: players.find(p => p.odw_uid === myUserId)?.odw_name || "Você",
    odw_level: players.find(p => p.odw_uid === myUserId)?.odw_level || 1,
    odw_avatar_customization: players.find(p => p.odw_uid === myUserId)?.odw_avatar_customization || null,
    odw_vip_hair_name: players.find(p => p.odw_uid === myUserId)?.odw_vip_hair_name || null,
    odw_vip_shirt_name: players.find(p => p.odw_uid === myUserId)?.odw_vip_shirt_name || null,
    odw_last_message: players.find(p => p.odw_uid === myUserId)?.odw_last_message || null,
    odw_message_timestamp: players.find(p => p.odw_uid === myUserId)?.odw_message_timestamp || null,
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      style={{ width, height }}
    >
      {/* World canvas */}
      <SideScrollingWorld
        viewportWidth={width}
        viewportHeight={height}
        playerX={playerWorldX}
        onLocationClick={handleLocationClick}
        onGroundClick={handleGroundClick}
      />

      {/* Other players */}
      {players
        .filter((p) => p.odw_uid !== myUserId)
        .map((player) => {
          const screenX = worldToScreen(player.odw_x);
          // Only render if on screen
          if (screenX < -50 || screenX > width + 50) return null;

          // Create screen-positioned player
          const screenPlayer: LobbyPlayer = {
            ...player,
            odw_x: screenX,
            odw_y: player.odw_y || (groundY - 40),
          };

          return (
            <LobbyAvatar
              key={player.odw_uid}
              player={screenPlayer}
              isMe={false}
              compact={!isFullscreen}
            />
          );
        })}

      {/* Current player */}
      {myUserId && (
        <div
          className="absolute transition-all duration-75 z-20"
          style={{
            left: worldToScreen(playerWorldX),
            top: groundY - 40,
            transform: `translate(-50%, -50%) scaleX(${facingRight ? 1 : -1})`,
          }}
        >
          <div style={{ transform: `scaleX(${facingRight ? 1 : -1})` }}>
            <LobbyAvatar
              player={{
                ...currentPlayer,
                odw_x: 0,
                odw_y: 0,
              }}
              isMe={true}
              compact={!isFullscreen}
            />
          </div>
        </div>
      )}

      {/* Location indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full z-30">
        <span className="text-white/90 text-sm font-medium">
          🏘️ Vila Principal
        </span>
      </div>

      {/* Close button for fullscreen */}
      {isFullscreen && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm transition-colors z-30"
        >
          ✕ Fechar
        </button>
      )}

      {/* Mini-map */}
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 z-30">
        <div className="relative w-32 h-8 bg-muted/50 rounded overflow-hidden">
          {/* World representation */}
          <div className="absolute inset-0 flex items-center">
            {BUILDINGS.map((b) => (
              <div
                key={b.id}
                className="absolute w-1 h-3 rounded-sm"
                style={{
                  left: `${(b.x / WORLD_WIDTH) * 100}%`,
                  backgroundColor: b.roofColor,
                }}
              />
            ))}
          </div>

          {/* Viewport indicator */}
          <div
            className="absolute top-0 h-full bg-white/20 border border-white/40 rounded"
            style={{
              left: `${(cameraX / WORLD_WIDTH) * 100}%`,
              width: `${(width / WORLD_WIDTH) * 100}%`,
            }}
          />

          {/* Player position */}
          <div
            className="absolute top-1/2 w-2 h-2 bg-primary rounded-full -translate-y-1/2"
            style={{
              left: `${(playerWorldX / WORLD_WIDTH) * 100}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-white/60 text-center mt-1">Mapa</p>
      </div>

      {/* Chat */}
      {user && (
        <div className="absolute bottom-3 left-3 right-40 z-30">
          <FloatingChat />
        </div>
      )}
    </div>
  );
}
