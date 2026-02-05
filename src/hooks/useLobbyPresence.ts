import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/hooks/useCharacter";
import { useEquippedVipClothing } from "@/hooks/useVipClothing";

export interface LobbyPlayer {
  odw_uid: string;
  odw_x: number;
  odw_y: number;
  odw_name: string;
  odw_level: number;
  odw_avatar_customization: string | null;
  odw_vip_hair_name: string | null;
  odw_vip_shirt_name: string | null;
  odw_last_message: string | null;
  odw_message_timestamp: number | null;
}

interface PresenceState {
  [key: string]: LobbyPlayer[];
}

const LOBBY_CHANNEL = "water-lobby";

export function useLobbyPresence() {
  const { user } = useAuth();
  const { data: character } = useCharacter();
  const { data: vipClothing } = useEquippedVipClothing();
  
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [myPosition, setMyPosition] = useState({ x: 300, y: 200 });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isJoined = useRef(false);

  // Update my position in the channel
  const updatePosition = useCallback((x: number, y: number) => {
    setMyPosition({ x, y });
    if (channelRef.current && isJoined.current) {
      channelRef.current.track({
        odw_uid: user?.id,
        odw_x: x,
        odw_y: y,
        odw_name: character?.name || "Jogador",
        odw_level: character?.level || 1,
        odw_avatar_customization: character?.avatar_customization || null,
        odw_vip_hair_name: vipClothing?.hair?.name || null,
        odw_vip_shirt_name: vipClothing?.shirt?.name || null,
        odw_last_message: null,
        odw_message_timestamp: null,
      });
    }
  }, [user?.id, character, vipClothing]);

  // Broadcast a chat message bubble
  const broadcastMessage = useCallback((message: string) => {
    if (channelRef.current && isJoined.current) {
      channelRef.current.track({
        odw_uid: user?.id,
        odw_x: myPosition.x,
        odw_y: myPosition.y,
        odw_name: character?.name || "Jogador",
        odw_level: character?.level || 1,
        odw_avatar_customization: character?.avatar_customization || null,
        odw_vip_hair_name: vipClothing?.hair?.name || null,
        odw_vip_shirt_name: vipClothing?.shirt?.name || null,
        odw_last_message: message,
        odw_message_timestamp: Date.now(),
      });
    }
  }, [user?.id, myPosition, character, vipClothing]);

  // Join lobby
  useEffect(() => {
    if (!user || !character) return;

    const channel = supabase.channel(LOBBY_CHANNEL, {
      config: {
        presence: { key: user.id },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state: PresenceState = channel.presenceState();
        const allPlayers: LobbyPlayer[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.odw_uid) {
              allPlayers.push(presence as LobbyPlayer);
            }
          });
        });
        
        setPlayers(allPlayers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          isJoined.current = true;
          // Track initial position
          await channel.track({
            odw_uid: user.id,
            odw_x: myPosition.x,
            odw_y: myPosition.y,
            odw_name: character.name || "Jogador",
            odw_level: character.level || 1,
            odw_avatar_customization: character.avatar_customization || null,
            odw_vip_hair_name: vipClothing?.hair?.name || null,
            odw_vip_shirt_name: vipClothing?.shirt?.name || null,
            odw_last_message: null,
            odw_message_timestamp: null,
          });
        }
      });

    return () => {
      isJoined.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, character?.name, character?.level, character?.avatar_customization]);

  return {
    players,
    myPosition,
    updatePosition,
    broadcastMessage,
    myUserId: user?.id,
  };
}
