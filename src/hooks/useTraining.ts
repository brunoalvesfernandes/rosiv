import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TrainingSession {
  id: string;
  user_id: string;
  stat_type: "strength" | "defense" | "vitality" | "agility" | "luck";
  status: "active" | "completed" | "cancelled";
  energy_cost: number;
  stat_gain: number;
  started_at: string;
  completes_at: string;
  completed_at: string | null;
}

export function useTrainingSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["training-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrainingSession[];
    },
    enabled: !!user,
    refetchInterval: 10000,
  });
}

export function useActiveTraining() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["active-training", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as TrainingSession[];
    },
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useStartTraining() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      statType, 
      durationMinutes = 60 
    }: { 
      statType: "strength" | "defense" | "vitality" | "agility" | "luck";
      durationMinutes?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const energyCost = 10;
      const statGain = Math.max(1, Math.floor(durationMinutes / 30)); // 1 point per 30 min

      // Check energy and active training slots
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("current_energy")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;
      if (character.current_energy < energyCost) {
        throw new Error("Energia insuficiente!");
      }

      // Check active training count (max 3)
      const { data: activeTrainings } = await supabase
        .from("training_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (activeTrainings && activeTrainings.length >= 3) {
        throw new Error("Você já tem 3 treinos ativos!");
      }

      // Deduct energy
      await supabase
        .from("characters")
        .update({ current_energy: character.current_energy - energyCost })
        .eq("user_id", user.id);

      // Create training session
      const completesAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from("training_sessions")
        .insert({
          user_id: user.id,
          stat_type: statType,
          energy_cost: energyCost,
          stat_gain: statGain,
          completes_at: completesAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-training"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Treino iniciado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCompleteTraining() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (training: TrainingSession) => {
      if (!user) throw new Error("Not authenticated");

      // Check if training is ready
      if (new Date(training.completes_at) > new Date()) {
        throw new Error("Treino ainda não concluído!");
      }

      // Update training status
      await supabase
        .from("training_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", training.id);

      // Get current character stats
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      // Apply stat gain
      const updates: Record<string, number> = {
        [training.stat_type]: (character as any)[training.stat_type] + training.stat_gain,
      };

      // If vitality, also increase max_hp
      if (training.stat_type === "vitality") {
        updates.max_hp = character.max_hp + training.stat_gain * 10;
      }

      await supabase
        .from("characters")
        .update(updates)
        .eq("user_id", user.id);

      return training;
    },
    onSuccess: (training) => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-training"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success(`Treino concluído! +${training.stat_gain} ${training.stat_type}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
