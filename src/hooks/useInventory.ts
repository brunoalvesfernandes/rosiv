import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  price: number;
  strength_bonus: number;
  defense_bonus: number;
  vitality_bonus: number;
  agility_bonus: number;
  luck_bonus: number;
  mana_bonus: number;
  hp_restore: number;
  energy_restore: number;
  mana_restore: number;
  min_level: number;
  is_consumable: boolean;
  icon: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  acquired_at: string;
  created_at: string;
  item: Item;
}

export function useShopItems() {
  return useQuery({
    queryKey: ["shop-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("type")
        .order("min_level")
        .order("price");

      if (error) throw error;
      return data as Item[];
    },
  });
}

export function useInventory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_inventory")
        .select("*, item:items(*)")
        .eq("user_id", user.id)
        .order("acquired_at", { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!user,
  });
}

export function useEquippedItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["equipped-items", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_inventory")
        .select("*, item:items(*)")
        .eq("user_id", user.id)
        .eq("is_equipped", true);

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!user,
  });
}

export function useBuyItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ item, quantity = 1 }: { item: Item; quantity?: number }) => {
      if (!user) throw new Error("Not authenticated");

      const totalCost = item.price * quantity;

      // Get current gold
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold, level")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;
      if (character.gold < totalCost) throw new Error("Ouro insuficiente");
      if (character.level < item.min_level) throw new Error(`Nível ${item.min_level} necessário`);

      // Deduct gold
      const { error: goldError } = await supabase
        .from("characters")
        .update({ gold: character.gold - totalCost })
        .eq("user_id", user.id);

      if (goldError) throw goldError;

      // Check if item already in inventory
      const { data: existing } = await supabase
        .from("player_inventory")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", item.id)
        .single();

      if (existing) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("player_inventory")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("player_inventory")
          .insert({
            user_id: user.id,
            item_id: item.id,
            quantity: quantity,
          });

        if (insertError) throw insertError;
      }

      return { item, quantity };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Comprou ${data.quantity}x ${data.item.name}!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useEquipItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inventoryItem: InventoryItem) => {
      if (!user) throw new Error("Not authenticated");

      // Unequip any other item of the same type
      const { data: equipped } = await supabase
        .from("player_inventory")
        .select("*, item:items(*)")
        .eq("user_id", user.id)
        .eq("is_equipped", true);

      if (equipped) {
        const sameTypeEquipped = equipped.find(
          (e) => (e.item as Item).type === inventoryItem.item.type
        );
        
        if (sameTypeEquipped) {
          await supabase
            .from("player_inventory")
            .update({ is_equipped: false })
            .eq("id", sameTypeEquipped.id);
        }
      }

      // Equip the new item
      const { error } = await supabase
        .from("player_inventory")
        .update({ is_equipped: true })
        .eq("id", inventoryItem.id);

      if (error) throw error;
      return inventoryItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["equipped-items"] });
      toast.success(`${data.item.name} equipado!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUnequipItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inventoryItem: InventoryItem) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("player_inventory")
        .update({ is_equipped: false })
        .eq("id", inventoryItem.id);

      if (error) throw error;
      return inventoryItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["equipped-items"] });
      toast.success(`${data.item.name} desequipado!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUsePotion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inventoryItem: InventoryItem) => {
      if (!user) throw new Error("Not authenticated");
      if (!inventoryItem.item.is_consumable) throw new Error("Item não consumível");

      // Get current character stats
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("current_hp, max_hp, current_energy, max_energy, current_mana, max_mana")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      const updates: Record<string, number> = {};
      const item = inventoryItem.item;

      if (item.hp_restore > 0) {
        updates.current_hp = Math.min(character.current_hp + item.hp_restore, character.max_hp);
      }
      if (item.energy_restore > 0) {
        updates.current_energy = Math.min(character.current_energy + item.energy_restore, character.max_energy);
      }
      if (item.mana_restore > 0) {
        updates.current_mana = Math.min(character.current_mana + item.mana_restore, character.max_mana);
      }

      // Apply effects
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("characters")
          .update(updates)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      }

      // Reduce quantity or delete
      if (inventoryItem.quantity > 1) {
        const { error: invError } = await supabase
          .from("player_inventory")
          .update({ quantity: inventoryItem.quantity - 1 })
          .eq("id", inventoryItem.id);

        if (invError) throw invError;
      } else {
        const { error: delError } = await supabase
          .from("player_inventory")
          .delete()
          .eq("id", inventoryItem.id);

        if (delError) throw delError;
      }

      return inventoryItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Usou ${data.item.name}!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
