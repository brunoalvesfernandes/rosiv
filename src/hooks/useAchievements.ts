import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "./useCharacter";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  category: string;
  requirement_type: string;
  requirement_value: number;
  gold_reward: number;
  xp_reward: number;
}

export interface PlayerAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  claimed: boolean;
  achievement?: Achievement;
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function usePlayerAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["player-achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_achievements")
        .select("*, achievement:achievements(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((pa) => ({
        ...pa,
        achievement: pa.achievement as Achievement,
      })) as PlayerAchievement[];
    },
    enabled: !!user,
  });
}

export function useClaimAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerAchievement: PlayerAchievement) => {
      if (!user) throw new Error("Não autenticado");
      if (playerAchievement.claimed) throw new Error("Recompensa já resgatada");

      const achievement = playerAchievement.achievement;
      if (!achievement) throw new Error("Conquista não encontrada");

      // Get current character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold, current_xp")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      // Update character with rewards
      await supabase
        .from("characters")
        .update({
          gold: character.gold + achievement.gold_reward,
          current_xp: character.current_xp + achievement.xp_reward,
        })
        .eq("user_id", user.id);

      // Mark achievement as claimed
      await supabase
        .from("player_achievements")
        .update({ claimed: true })
        .eq("id", playerAchievement.id);

      return achievement;
    },
    onSuccess: (achievement) => {
      toast.success(`Recompensa resgatada: +${achievement.gold_reward} ouro, +${achievement.xp_reward} XP!`);
      queryClient.invalidateQueries({ queryKey: ["player-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to check and unlock achievements
export function useCheckAchievements() {
  const { user } = useAuth();
  const { data: character } = useCharacter();
  const { data: achievements } = useAchievements();
  const { data: playerAchievements } = usePlayerAchievements();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !character || !achievements || !playerAchievements) return;

    const checkAndUnlock = async () => {
      const unlockedIds = new Set(playerAchievements.map((pa) => pa.achievement_id));

      for (const achievement of achievements) {
        if (unlockedIds.has(achievement.id)) continue;

        let currentValue = 0;
        switch (achievement.requirement_type) {
          case "level":
            currentValue = character.level;
            break;
          case "wins":
            currentValue = character.wins;
            break;
          case "missions_completed":
            currentValue = character.missions_completed;
            break;
          case "gold":
            currentValue = character.gold;
            break;
          case "arena_points":
            currentValue = character.arena_points;
            break;
          default:
            continue;
        }

        if (currentValue >= achievement.requirement_value) {
          // Unlock achievement
          const { error } = await supabase.from("player_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

          if (!error) {
            toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`, {
              duration: 5000,
            });
            queryClient.invalidateQueries({ queryKey: ["player-achievements"] });
          }
        }
      }
    };

    checkAndUnlock();
  }, [user, character, achievements, playerAchievements, queryClient]);
}

// Get achievement stats
export function useAchievementStats() {
  const { data: achievements } = useAchievements();
  const { data: playerAchievements } = usePlayerAchievements();

  const total = achievements?.length || 0;
  const unlocked = playerAchievements?.length || 0;
  const claimed = playerAchievements?.filter((pa) => pa.claimed).length || 0;
  const unclaimed = unlocked - claimed;

  return {
    total,
    unlocked,
    claimed,
    unclaimed,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  };
}
