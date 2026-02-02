import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Pet {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rarity: string;
  ability_type: string;
  ability_value: number;
  ability_cooldown: number;
  strength_bonus: number;
  defense_bonus: number;
  agility_bonus: number;
  luck_bonus: number;
  vitality_bonus: number;
}

export interface PlayerPet {
  id: string;
  user_id: string;
  pet_id: string;
  is_active: boolean;
  nickname: string | null;
  level: number;
  experience: number;
  acquired_at: string;
  last_ability_use: string | null;
  pet?: Pet;
}

export function usePets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available pets
  const { data: allPets, isLoading: isLoadingPets } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("rarity", { ascending: false });
      
      if (error) throw error;
      return data as Pet[];
    },
  });

  // Fetch player's pets
  const { data: playerPets, isLoading: isLoadingPlayerPets } = useQuery({
    queryKey: ["player_pets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("player_pets")
        .select(`
          *,
          pet:pets(*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as (PlayerPet & { pet: Pet })[];
    },
    enabled: !!user,
  });

  // Get active pet
  const activePet = playerPets?.find(p => p.is_active);

  // Activate pet mutation
  const activatePet = useMutation({
    mutationFn: async (petId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Deactivate all pets first
      const { error: deactivateError } = await supabase
        .from("player_pets")
        .update({ is_active: false })
        .eq("user_id", user.id);
      
      if (deactivateError) throw deactivateError;

      // Activate selected pet
      const { error } = await supabase
        .from("player_pets")
        .update({ is_active: true })
        .eq("id", petId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player_pets"] });
      toast.success("Pet ativado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao ativar pet: " + error.message);
    },
  });

  // Deactivate pet mutation
  const deactivatePet = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("player_pets")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player_pets"] });
      toast.success("Pet desativado!");
    },
    onError: (error) => {
      toast.error("Erro ao desativar pet: " + error.message);
    },
  });

  // Use pet ability
  const useAbility = useMutation({
    mutationFn: async (playerPetId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("player_pets")
        .update({ last_ability_use: new Date().toISOString() })
        .eq("id", playerPetId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player_pets"] });
    },
  });

  // Rename pet mutation
  const renamePet = useMutation({
    mutationFn: async ({ petId, nickname }: { petId: string; nickname: string }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("player_pets")
        .update({ nickname })
        .eq("id", petId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player_pets"] });
      toast.success("Pet renomeado!");
    },
    onError: (error) => {
      toast.error("Erro ao renomear pet: " + error.message);
    },
  });

  return {
    allPets,
    playerPets,
    activePet,
    isLoading: isLoadingPets || isLoadingPlayerPets,
    activatePet,
    deactivatePet,
    useAbility,
    renamePet,
  };
}

// Helper to get ability description
export function getAbilityDescription(type: string, value: number): string {
  const descriptions: Record<string, string> = {
    invisibility: `Fica invisível por ${value} segundos`,
    heal: `Cura ${value}% do HP a cada uso`,
    strength_boost: `+${value}% de força em batalha`,
    collector: `Coleta ${value}% mais recursos`,
    shield: `Absorve ${value}% do dano recebido`,
    speed: `+${value}% de velocidade de ataque`,
  };
  return descriptions[type] || "Habilidade especial";
}

// Helper to get rarity color
export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "text-muted-foreground",
    uncommon: "text-green-500",
    rare: "text-blue-500",
    epic: "text-purple-500",
    legendary: "text-gold",
  };
  return colors[rarity] || "text-foreground";
}

// Helper to get rarity bg
export function getRarityBg(rarity: string): string {
  const colors: Record<string, string> = {
    common: "bg-muted",
    uncommon: "bg-green-500/20",
    rare: "bg-blue-500/20",
    epic: "bg-purple-500/20",
    legendary: "bg-gold/20",
  };
  return colors[rarity] || "bg-muted";
}
