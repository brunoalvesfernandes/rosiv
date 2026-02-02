import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

// Regeneration rates (in minutes)
const HP_REGEN_RATE = 2; // 1 HP every 2 minutes
const ENERGY_REGEN_RATE = 1; // 1 Energy every 1 minute

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
  last_hp_regen: string;
  last_energy_regen: string;
  created_at: string;
  updated_at: string;
}

async function applyRegeneration(userId: string, character: Character): Promise<Character> {
  const now = new Date();
  const lastHpRegen = new Date(character.last_hp_regen);
  const lastEnergyRegen = new Date(character.last_energy_regen);

  // Calculate minutes passed
  const hpMinutesPassed = Math.floor((now.getTime() - lastHpRegen.getTime()) / 60000);
  const energyMinutesPassed = Math.floor((now.getTime() - lastEnergyRegen.getTime()) / 60000);

  // Calculate regeneration
  const hpToRegen = Math.floor(hpMinutesPassed / HP_REGEN_RATE);
  const energyToRegen = Math.floor(energyMinutesPassed / ENERGY_REGEN_RATE);

  // Check if any regeneration is needed
  if (hpToRegen <= 0 && energyToRegen <= 0) {
    return character;
  }

  const updates: Partial<Character> = {};

  if (hpToRegen > 0 && character.current_hp < character.max_hp) {
    const newHp = Math.min(character.current_hp + hpToRegen, character.max_hp);
    updates.current_hp = newHp;
    updates.last_hp_regen = now.toISOString();
  }

  if (energyToRegen > 0 && character.current_energy < character.max_energy) {
    const newEnergy = Math.min(character.current_energy + energyToRegen, character.max_energy);
    updates.current_energy = newEnergy;
    updates.last_energy_regen = now.toISOString();
  }

  // Only update if there are changes
  if (Object.keys(updates).length === 0) {
    return character;
  }

  const { data, error } = await supabase
    .from("characters")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error applying regeneration:", error);
    return character;
  }

  return data as Character;
}

export function useCharacter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const regenAppliedRef = useRef(false);

  const query = useQuery({
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

  // Apply regeneration when character data is loaded
  useEffect(() => {
    if (query.data && user && !regenAppliedRef.current) {
      regenAppliedRef.current = true;
      applyRegeneration(user.id, query.data).then((updatedChar) => {
        if (updatedChar !== query.data) {
          queryClient.setQueryData(["character", user.id], updatedChar);
        }
      });
    }
    
    // Reset ref when user changes
    if (!user) {
      regenAppliedRef.current = false;
    }
  }, [query.data, user, queryClient]);

  // Set up periodic regeneration check (every minute)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const currentData = queryClient.getQueryData<Character>(["character", user.id]);
      if (currentData) {
        const updatedChar = await applyRegeneration(user.id, currentData);
        if (updatedChar !== currentData) {
          queryClient.setQueryData(["character", user.id], updatedChar);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, queryClient]);

  return query;
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
