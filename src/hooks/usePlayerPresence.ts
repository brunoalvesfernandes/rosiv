import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnlinePlayer {
  user_id: string;
  character_name: string;
  is_online: boolean;
  last_seen: string;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const OFFLINE_THRESHOLD = 60000; // 1 minute

export function usePlayerPresence(characterName?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Update presence on mount and periodically
  useEffect(() => {
    if (!user || !characterName) return;

    const updatePresence = async () => {
      try {
        const { error } = await supabase
          .from("player_presence")
          .upsert({
            user_id: user.id,
            character_name: characterName,
            is_online: true,
            last_seen: new Date().toISOString(),
          }, {
            onConflict: "user_id"
          });

        if (error) console.error("Failed to update presence:", error);
      } catch (err) {
        console.error("Presence update error:", err);
      }
    };

    // Initial update
    updatePresence();

    // Heartbeat
    const interval = setInterval(updatePresence, HEARTBEAT_INTERVAL);

    // Go offline when leaving
    const handleBeforeUnload = async () => {
      await supabase
        .from("player_presence")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Mark offline when component unmounts
      supabase
        .from("player_presence")
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
    };
  }, [user, characterName]);

  return null;
}

export function useOnlinePlayers(searchTerm?: string) {
  return useQuery({
    queryKey: ["online-players", searchTerm],
    queryFn: async () => {
      const thresholdTime = new Date(Date.now() - OFFLINE_THRESHOLD).toISOString();
      
      let query = supabase
        .from("player_presence")
        .select("*")
        .eq("is_online", true)
        .gte("last_seen", thresholdTime)
        .order("character_name");

      if (searchTerm && searchTerm.length > 0) {
        query = query.ilike("character_name", `${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return (data || []) as OnlinePlayer[];
    },
    staleTime: 5000,
    refetchInterval: 10000,
  });
}
