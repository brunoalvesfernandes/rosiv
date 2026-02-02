import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateMaterialDrops, formatDropMessage, Difficulty } from "@/utils/materialDrops";
export interface Mission {
  id: string;
  title: string;
  description: string;
  category: "story" | "daily" | "grind" | "boss";
  difficulty: "easy" | "medium" | "hard" | "boss";
  min_level: number;
  xp_reward: number;
  gold_reward: number;
  duration_minutes: number;
  energy_cost: number;
  is_repeatable: boolean;
  cooldown_minutes: number;
}

export interface PlayerMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: "active" | "completed" | "failed";
  started_at: string;
  completes_at: string;
  completed_at: string | null;
  mission?: Mission;
}

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("min_level", { ascending: true });

      if (error) throw error;
      return data as Mission[];
    },
  });
}

export function usePlayerMissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["player-missions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_missions")
        .select(`
          *,
          mission:missions(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (PlayerMission & { mission: Mission })[];
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds to check for completed missions
  });
}

export function useStartMission() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (mission: Mission) => {
      if (!user) throw new Error("Not authenticated");

      // Check if player has enough energy
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("current_energy")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;
      if (character.current_energy < mission.energy_cost) {
        throw new Error("Energia insuficiente!");
      }

      // Check if there's an active mission of the same type (for non-repeatable)
      const { data: activeMissions } = await supabase
        .from("player_missions")
        .select("*")
        .eq("user_id", user.id)
        .eq("mission_id", mission.id)
        .eq("status", "active");

      if (activeMissions && activeMissions.length > 0) {
        throw new Error("Você já está fazendo esta missão!");
      }

      // Deduct energy
      await supabase
        .from("characters")
        .update({ current_energy: character.current_energy - mission.energy_cost })
        .eq("user_id", user.id);

      // Calculate completion time
      const completesAt = new Date(Date.now() + mission.duration_minutes * 60 * 1000);

      // Create player mission
      const { data, error } = await supabase
        .from("player_missions")
        .insert({
          user_id: user.id,
          mission_id: mission.id,
          completes_at: completesAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-missions"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Missão iniciada!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (playerMission: PlayerMission & { mission: Mission }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if mission is ready to complete
      if (new Date(playerMission.completes_at) > new Date()) {
        throw new Error("Missão ainda não concluída!");
      }

      // Update player mission status
      await supabase
        .from("player_missions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", playerMission.id);

      // Get current character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      // Add rewards
      const newXp = character.current_xp + playerMission.mission.xp_reward;
      const newGold = character.gold + playerMission.mission.gold_reward;
      let newLevel = character.level;
      let xpToNext = character.xp_to_next_level;
      let availablePoints = character.available_points;
      let remainingXp = newXp;

      // Level up check
      while (remainingXp >= xpToNext) {
        remainingXp -= xpToNext;
        newLevel++;
        availablePoints += 5;
        xpToNext = Math.floor(xpToNext * 1.5); // Exponential XP curve
      }

      await supabase
        .from("characters")
        .update({
          current_xp: remainingXp,
          xp_to_next_level: xpToNext,
          gold: newGold,
          level: newLevel,
          available_points: availablePoints,
          missions_completed: character.missions_completed + 1,
        })
        .eq("user_id", user.id);

      // Generate material drops based on mission difficulty
      const difficulty = playerMission.mission.difficulty as Difficulty;
      const drops = await generateMaterialDrops(user.id, "mission", difficulty);

      return { levelUp: newLevel > character.level, newLevel, drops };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["player-missions"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
      
      if (result.levelUp) {
        toast.success(`🎉 Subiu para o nível ${result.newLevel}! +5 pontos de atributo`);
      } else {
        toast.success("Missão concluída! Recompensas recebidas.");
      }
      
      if (result.drops.length > 0) {
        toast.success(formatDropMessage(result.drops), { duration: 5000 });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
