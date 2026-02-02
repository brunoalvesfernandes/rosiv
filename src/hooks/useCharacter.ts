import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  current_xp: number;
  xp_to_next_level: number;
  current_hp: number;
  max_hp: number;
  current_energy: number;
  max_energy: number;
  gold: number;
  strength: number;
  defense: number;
  vitality: number;
  agility: number;
  luck: number;
  available_points: number;
  total_battles: number;
  wins: number;
  missions_completed: number;
  arena_points: number;
  is_protected: boolean;
  protection_until: string | null;
  created_at: string;
  updated_at: string;
}

export function useCharacter() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["character", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Character;
    },
    enabled: !!user,
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar personagem: " + error.message);
    },
  });
}

export function useAddStatPoint() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (stat: "strength" | "defense" | "vitality" | "agility" | "luck") => {
      if (!user) throw new Error("Not authenticated");

      // Get current character
      const { data: character, error: fetchError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;
      if (character.available_points <= 0) throw new Error("Sem pontos disponíveis");

      // Update stat and decrease available points
      const updates: Record<string, number> = {
        [stat]: (character as any)[stat] + 1,
        available_points: character.available_points - 1,
      };

      // If vitality, also increase max_hp
      if (stat === "vitality") {
        updates.max_hp = character.max_hp + 10;
        updates.current_hp = Math.min(character.current_hp + 10, character.max_hp + 10);
      }

      const { data, error } = await supabase
        .from("characters")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Atributo aumentado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("arena_points", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Character[];
    },
  });
}

export function useArenaOpponents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["arena-opponents", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get current character level first
      const { data: myCharacter } = await supabase
        .from("characters")
        .select("level")
        .eq("user_id", user.id)
        .single();

      if (!myCharacter) return [];

      // Get opponents within ±5 levels
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .neq("user_id", user.id)
        .gte("level", Math.max(1, myCharacter.level - 5))
        .lte("level", myCharacter.level + 5)
        .eq("is_protected", false)
        .limit(10);

      if (error) throw error;
      return data as Character[];
    },
    enabled: !!user,
  });
}
