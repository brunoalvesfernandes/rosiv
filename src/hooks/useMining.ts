import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Pickaxe {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  max_durability: number;
  mining_power: number;
  price: number | null;
  is_craftable: boolean;
}

export interface PlayerPickaxe {
  id: string;
  user_id: string;
  pickaxe_id: string;
  current_durability: number;
  is_equipped: boolean;
  pickaxe?: Pickaxe;
}

export interface MiningNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  hp: number;
  required_mining_power: number;
  tier: number;
}

export interface MiningDrop {
  id: string;
  node_id: string;
  material_id: string;
  drop_chance: number;
  min_quantity: number;
  max_quantity: number;
}

// Fetch all pickaxes available
export function usePickaxes() {
  return useQuery({
    queryKey: ["pickaxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pickaxes")
        .select("*")
        .order("mining_power", { ascending: true });

      if (error) throw error;
      return data as Pickaxe[];
    },
  });
}

// Fetch player's owned pickaxes
export function usePlayerPickaxes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["player-pickaxes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_pickaxes")
        .select("*, pickaxe:pickaxes(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((pp) => ({
        ...pp,
        pickaxe: pp.pickaxe as Pickaxe,
      })) as PlayerPickaxe[];
    },
    enabled: !!user,
  });
}

// Fetch mining nodes
export function useMiningNodes() {
  return useQuery({
    queryKey: ["mining-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mining_nodes")
        .select("*")
        .order("tier", { ascending: true });

      if (error) throw error;
      return data as MiningNode[];
    },
  });
}

// Fetch mining drops with material info
export function useMiningDrops() {
  return useQuery({
    queryKey: ["mining-drops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mining_drops")
        .select("*, material:materials(*)");

      if (error) throw error;
      return data as (MiningDrop & { material: { id: string; name: string; icon: string; rarity: string } })[];
    },
  });
}

// Add mined materials to player inventory
export function useAddMinedMaterial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialId, quantity }: { materialId: string; quantity: number }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if player already has this material
      const { data: existing, error: fetchError } = await supabase
        .from("player_materials")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("player_materials")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from("player_materials")
          .insert({
            user_id: user.id,
            material_id: materialId,
            quantity: quantity,
          });

        if (insertError) throw insertError;
      }

      return { materialId, quantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
    },
    onError: (error: Error) => {
      console.error("Error adding material:", error);
    },
  });
}

// Buy a pickaxe from shop
export function useBuyPickaxe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pickaxe: Pickaxe) => {
      if (!user) throw new Error("Não autenticado");
      if (!pickaxe.price) throw new Error("Esta picareta não está à venda");

      // Check player gold
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;
      if (character.gold < pickaxe.price) {
        throw new Error("Ouro insuficiente");
      }

      // Deduct gold
      await supabase
        .from("characters")
        .update({ gold: character.gold - pickaxe.price })
        .eq("user_id", user.id);

      // Add pickaxe to player
      const { error: insertError } = await supabase
        .from("player_pickaxes")
        .insert({
          user_id: user.id,
          pickaxe_id: pickaxe.id,
          current_durability: pickaxe.max_durability,
          is_equipped: false,
        });

      if (insertError) throw insertError;

      return pickaxe;
    },
    onSuccess: (pickaxe) => {
      toast.success(`Comprou: ${pickaxe.name}!`);
      queryClient.invalidateQueries({ queryKey: ["player-pickaxes"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Equip a pickaxe
export function useEquipPickaxe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerPickaxeId: string) => {
      if (!user) throw new Error("Não autenticado");

      // Unequip all pickaxes first
      await supabase
        .from("player_pickaxes")
        .update({ is_equipped: false })
        .eq("user_id", user.id);

      // Equip the selected one
      const { error } = await supabase
        .from("player_pickaxes")
        .update({ is_equipped: true })
        .eq("id", playerPickaxeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Picareta equipada!");
      queryClient.invalidateQueries({ queryKey: ["player-pickaxes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update pickaxe durability
export function useUpdateDurability() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerPickaxeId, newDurability }: { playerPickaxeId: string; newDurability: number }) => {
      if (!user) throw new Error("Não autenticado");

      if (newDurability <= 0) {
        // Delete broken pickaxe
        await supabase
          .from("player_pickaxes")
          .delete()
          .eq("id", playerPickaxeId);
        
        return { broken: true };
      }

      const { error } = await supabase
        .from("player_pickaxes")
        .update({ current_durability: newDurability })
        .eq("id", playerPickaxeId);

      if (error) throw error;
      return { broken: false };
    },
    onSuccess: (result) => {
      if (result.broken) {
        toast.error("Sua picareta quebrou!");
      }
      queryClient.invalidateQueries({ queryKey: ["player-pickaxes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Repair pickaxe
export function useRepairPickaxe() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerPickaxe, repairAmount, cost }: { playerPickaxe: PlayerPickaxe; repairAmount: number; cost: number }) => {
      if (!user) throw new Error("Não autenticado");

      // Check player gold
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;
      if (character.gold < cost) {
        throw new Error("Ouro insuficiente");
      }

      // Deduct gold
      await supabase
        .from("characters")
        .update({ gold: character.gold - cost })
        .eq("user_id", user.id);

      // Repair pickaxe
      const maxDurability = playerPickaxe.pickaxe?.max_durability || 100;
      const newDurability = Math.min(playerPickaxe.current_durability + repairAmount, maxDurability);

      const { error } = await supabase
        .from("player_pickaxes")
        .update({ current_durability: newDurability })
        .eq("id", playerPickaxe.id);

      if (error) throw error;

      return { repaired: repairAmount };
    },
    onSuccess: (result) => {
      toast.success(`Picareta reparada! +${result.repaired} durabilidade`);
      queryClient.invalidateQueries({ queryKey: ["player-pickaxes"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
