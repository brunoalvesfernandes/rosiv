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
  odw_is_typing: boolean;
  odw_is_sleeping: boolean;
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
  const [isTyping, setIsTyping] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isJoined = useRef(false);
  const lastMessageRef = useRef<string | null>(null);
  const lastMessageTimestampRef = useRef<number | null>(null);

  // Track current state to send with updates
  const trackState = useCallback((overrides: Partial<{
    x: number;
    y: number;
    message: string | null;
    messageTimestamp: number | null;
    typing: boolean;
    sleeping: boolean;
  }> = {}) => {
    if (!channelRef.current || !isJoined.current || !user) return;

    const x = overrides.x ?? myPosition.x;
    const y = overrides.y ?? myPosition.y;
    const message = overrides.message !== undefined ? overrides.message : lastMessageRef.current;
    const timestamp = overrides.messageTimestamp !== undefined ? overrides.messageTimestamp : lastMessageTimestampRef.current;
    const typing = overrides.typing ?? isTyping;
    const sleeping = overrides.sleeping ?? isSleeping;

    channelRef.current.track({
      odw_uid: user.id,
      odw_x: x,
      odw_y: y,
      odw_name: character?.name || "Jogador",
      odw_level: character?.level || 1,
      odw_avatar_customization: character?.avatar_customization || null,
      odw_vip_hair_name: vipClothing?.hair?.name || null,
      odw_vip_shirt_name: vipClothing?.shirt?.name || null,
      odw_last_message: message,
      odw_message_timestamp: timestamp,
      odw_is_typing: typing,
      odw_is_sleeping: sleeping,
    });
  }, [user, myPosition, character, vipClothing, isTyping, isSleeping]);

  // Update my position in the channel
  const updatePosition = useCallback((x: number, y: number) => {
    setMyPosition({ x, y });
    setIsSleeping(false); // Moving wakes up
    trackState({ x, y, sleeping: false });
  }, [trackState]);

  // Broadcast a chat message bubble
  const broadcastMessage = useCallback((message: string) => {
    lastMessageRef.current = message;
    lastMessageTimestampRef.current = Date.now();
    setIsTyping(false);
    trackState({ 
      message, 
      messageTimestamp: Date.now(),
      typing: false,
      sleeping: false,
    });
  }, [trackState]);

  // Set typing status
  const setTypingStatus = useCallback((typing: boolean) => {
    setIsTyping(typing);
    if (typing) {
      setIsSleeping(false);
    }
    trackState({ typing, sleeping: typing ? false : isSleeping });
  }, [trackState, isSleeping]);

  // Set sleeping status
  const setSleepingStatus = useCallback((sleeping: boolean) => {
    setIsSleeping(sleeping);
    if (sleeping) {
      setIsTyping(false);
    }
    trackState({ sleeping, typing: sleeping ? false : isTyping });
  }, [trackState, isTyping]);

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
        const playerMap = new Map<string, LobbyPlayer>();
        
        // Deduplicate by user ID - keep only one entry per player
        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.odw_uid) {
              // Ensure all fields have defaults
              const player: LobbyPlayer = {
                odw_uid: presence.odw_uid,
                odw_x: presence.odw_x ?? 300,
                odw_y: presence.odw_y ?? 200,
                odw_name: presence.odw_name ?? "Jogador",
                odw_level: presence.odw_level ?? 1,
                odw_avatar_customization: presence.odw_avatar_customization ?? null,
                odw_vip_hair_name: presence.odw_vip_hair_name ?? null,
                odw_vip_shirt_name: presence.odw_vip_shirt_name ?? null,
                odw_last_message: presence.odw_last_message ?? null,
                odw_message_timestamp: presence.odw_message_timestamp ?? null,
                odw_is_typing: presence.odw_is_typing ?? false,
                odw_is_sleeping: presence.odw_is_sleeping ?? false,
              };
              playerMap.set(presence.odw_uid, player);
            }
          });
        });
        
        setPlayers(Array.from(playerMap.values()));
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
            odw_is_typing: false,
            odw_is_sleeping: false,
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
    setTypingStatus,
    setSleepingStatus,
    isTyping,
    isSleeping,
    myUserId: user?.id,
  };
}
