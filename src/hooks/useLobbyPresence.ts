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
  const isMounted = useRef(true);
  const lastMessageRef = useRef<string | null>(null);
  const lastMessageTimestampRef = useRef<number | null>(null);
  
  // Use refs to track current state for async callbacks
  const stateRef = useRef({
    x: 300,
    y: 200,
    isTyping: false,
    isSleeping: false,
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current.x = myPosition.x;
    stateRef.current.y = myPosition.y;
  }, [myPosition]);

  useEffect(() => {
    stateRef.current.isTyping = isTyping;
  }, [isTyping]);

  useEffect(() => {
    stateRef.current.isSleeping = isSleeping;
  }, [isSleeping]);

  // Track current state to send with updates
  const trackState = useCallback((overrides: Partial<{
    x: number;
    y: number;
    message: string | null;
    messageTimestamp: number | null;
    typing: boolean;
    sleeping: boolean;
  }> = {}) => {
    if (!channelRef.current || !isJoined.current || !user || !isMounted.current) return;

    const x = overrides.x ?? stateRef.current.x;
    const y = overrides.y ?? stateRef.current.y;
    const message = overrides.message !== undefined ? overrides.message : lastMessageRef.current;
    const timestamp = overrides.messageTimestamp !== undefined ? overrides.messageTimestamp : lastMessageTimestampRef.current;
    const typing = overrides.typing ?? stateRef.current.isTyping;
    const sleeping = overrides.sleeping ?? stateRef.current.isSleeping;

    try {
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
    } catch (error) {
      console.error("Error tracking presence:", error);
    }
  }, [user, character, vipClothing]);

  // Update my position in the channel
  const updatePosition = useCallback((x: number, y: number) => {
    setMyPosition({ x, y });
    setIsSleeping(false);
    stateRef.current.x = x;
    stateRef.current.y = y;
    stateRef.current.isSleeping = false;
    trackState({ x, y, sleeping: false });
  }, [trackState]);

  // Broadcast a chat message bubble
  const broadcastMessage = useCallback((message: string) => {
    lastMessageRef.current = message;
    lastMessageTimestampRef.current = Date.now();
    setIsTyping(false);
    stateRef.current.isTyping = false;
    stateRef.current.isSleeping = false;
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
    stateRef.current.isTyping = typing;
    if (typing) {
      setIsSleeping(false);
      stateRef.current.isSleeping = false;
    }
    trackState({ typing, sleeping: typing ? false : stateRef.current.isSleeping });
  }, [trackState]);

  // Set sleeping status
  const setSleepingStatus = useCallback((sleeping: boolean) => {
    setIsSleeping(sleeping);
    stateRef.current.isSleeping = sleeping;
    if (sleeping) {
      setIsTyping(false);
      stateRef.current.isTyping = false;
    }
    trackState({ sleeping, typing: sleeping ? false : stateRef.current.isTyping });
  }, [trackState]);

  // Join lobby
  useEffect(() => {
    isMounted.current = true;
    
    if (!user || !character) return;

    const channel = supabase.channel(LOBBY_CHANNEL, {
      config: {
        presence: { key: user.id },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        if (!isMounted.current) return;
        
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
        if (status === "SUBSCRIBED" && isMounted.current) {
          isJoined.current = true;
          // Track initial position
          try {
            await channel.track({
              odw_uid: user.id,
              odw_x: stateRef.current.x,
              odw_y: stateRef.current.y,
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
          } catch (error) {
            console.error("Error tracking initial presence:", error);
          }
        }
      });

    return () => {
      isMounted.current = false;
      isJoined.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, character?.name, character?.level, character?.avatar_customization, vipClothing?.hair?.name, vipClothing?.shirt?.name]);

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
