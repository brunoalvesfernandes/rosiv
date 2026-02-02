import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

// Regeneration rates (in minutes)
const HP_REGEN_RATE = 2; // 1 HP every 2 minutes
const ENERGY_REGEN_RATE = 1; // 1 Energy every 1 minute
const MANA_REGEN_RATE = 1.5; // 1 Mana every 1.5 minutes

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
  last_mana_regen: string;
  current_mana: number;
  max_mana: number;
  class: "warrior" | "mage" | "archer";
  created_at: string;
  updated_at: string;
  // Appearance customization
  hair_style: string;
  hair_color: string;
  eye_color: string;
  skin_tone: string;
  face_style: string;
  accessory: string | null;
  // Clothing customization
  shirt_color: string;
  pants_color: string;
  shoes_color: string;
  avatar_id: string;
}

async function fetchAndRegenerate(userId: string): Promise<Character | null> {
  // Fetch character
  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  if (!character) return null;

  const now = new Date();
  const lastHpRegen = new Date(character.last_hp_regen);
  const lastEnergyRegen = new Date(character.last_energy_regen);
  const lastManaRegen = new Date(character.last_mana_regen);

  // Calculate minutes passed
  const hpMinutesPassed = Math.floor((now.getTime() - lastHpRegen.getTime()) / 60000);
  const energyMinutesPassed = Math.floor((now.getTime() - lastEnergyRegen.getTime()) / 60000);
  const manaMinutesPassed = Math.floor((now.getTime() - lastManaRegen.getTime()) / 60000);

  // Calculate regeneration
  const hpToRegen = Math.floor(hpMinutesPassed / HP_REGEN_RATE);
  const energyToRegen = Math.floor(energyMinutesPassed / ENERGY_REGEN_RATE);
  const manaToRegen = Math.floor(manaMinutesPassed / MANA_REGEN_RATE);

  const needsHpRegen = hpToRegen > 0 && character.current_hp < character.max_hp;
  const needsEnergyRegen = energyToRegen > 0 && character.current_energy < character.max_energy;
  const needsManaRegen = manaToRegen > 0 && character.current_mana < character.max_mana;

  // If no regeneration needed, return current data
  if (!needsHpRegen && !needsEnergyRegen && !needsManaRegen) {
    return character as Character;
  }

  // If no regeneration needed, return current data
  if (!needsHpRegen && !needsEnergyRegen) {
    return character as Character;
  }

  const updates: Record<string, unknown> = {};

  if (needsHpRegen) {
    updates.current_hp = Math.min(character.current_hp + hpToRegen, character.max_hp);
    updates.last_hp_regen = now.toISOString();
  }

  if (needsEnergyRegen) {
    updates.current_energy = Math.min(character.current_energy + energyToRegen, character.max_energy);
    updates.last_energy_regen = now.toISOString();
  }

  if (needsManaRegen) {
    updates.current_mana = Math.min(character.current_mana + manaToRegen, character.max_mana);
    updates.last_mana_regen = now.toISOString();
  }

  // Apply regeneration
  const { data: updatedCharacter, error: updateError } = await supabase
    .from("characters")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error("Error applying regeneration:", updateError);
    return character as Character;
  }

  return updatedCharacter as Character;
}

export function useCharacter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up periodic regeneration check (every minute)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["character", user.id] });
    }, 60000);

    return () => clearInterval(interval);
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["character", user?.id],
    queryFn: async () => {
      if (!user) return null;
      return fetchAndRegenerate(user.id);
    },
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
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

export interface RankedCharacter extends Character {
  guild_name?: string | null;
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      // Get all characters ordered by arena points
      const { data: characters, error } = await supabase
        .from("characters")
        .select("*")
        .order("arena_points", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!characters || characters.length === 0) return [];

      // Get all user IDs
      const userIds = characters.map(c => c.user_id);

      // Batch fetch all guild memberships
      const { data: memberships } = await supabase
        .from("guild_members")
        .select("user_id, guild_id")
        .in("user_id", userIds);

      // Get unique guild IDs
      const guildIds = [...new Set((memberships || []).map(m => m.guild_id))];

      // Batch fetch all guilds
      const { data: guilds } = await supabase
        .from("guilds")
        .select("id, name")
        .in("id", guildIds);

      // Create lookup maps
      const membershipMap = new Map((memberships || []).map(m => [m.user_id, m.guild_id]));
      const guildMap = new Map((guilds || []).map(g => [g.id, g.name]));

      // Map characters with guild names
      return characters.map(char => {
        const guildId = membershipMap.get(char.user_id);
        const guildName = guildId ? guildMap.get(guildId) : null;
        return { ...char, guild_name: guildName || null } as RankedCharacter;
      });
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
