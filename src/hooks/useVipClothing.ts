import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface VipClothing {
  id: string;
  name: string;
  description: string | null;
  type: "shirt" | "pants" | "hair" | "accessory";
  image_url: string | null;
  rarity: "vip" | "legendary" | "mythic";
  price_gold: number;
  price_premium: number;
  min_level: number;
  is_available: boolean;
  created_at: string;
}

export interface PlayerVipClothing {
  id: string;
  user_id: string;
  clothing_id: string;
  is_equipped: boolean;
  acquired_at: string;
  clothing?: VipClothing;
}

export function useVipClothingCatalog() {
  return useQuery({
    queryKey: ["vip-clothing-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vip_clothing")
        .select("*")
        .eq("is_available", true)
        .order("type")
        .order("rarity");

      if (error) throw error;
      return data as VipClothing[];
    },
  });
}

export function useMyVipClothing() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-vip-clothing", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_vip_clothing")
        .select("*, clothing:vip_clothing(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        clothing: item.clothing as VipClothing
      })) as PlayerVipClothing[];
    },
    enabled: !!user,
  });
}

export function useBuyVipClothing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (clothingId: string) => {
      if (!user) throw new Error("Não autenticado");

      // Get clothing info
      const { data: clothing, error: clothingError } = await supabase
        .from("vip_clothing")
        .select("*")
        .eq("id", clothingId)
        .single();

      if (clothingError) throw clothingError;

      // Check if already owned
      const { data: existing } = await supabase
        .from("player_vip_clothing")
        .select("id")
        .eq("user_id", user.id)
        .eq("clothing_id", clothingId)
        .single();

      if (existing) throw new Error("Você já possui este item!");

      // Get character gold
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold, level")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      if (character.level < clothing.min_level) {
        throw new Error(`Nível mínimo: ${clothing.min_level}`);
      }

      if (character.gold < clothing.price_gold) {
        throw new Error("Ouro insuficiente!");
      }

      // Deduct gold
      const { error: goldError } = await supabase
        .from("characters")
        .update({ gold: character.gold - clothing.price_gold })
        .eq("user_id", user.id);

      if (goldError) throw goldError;

      // Add to inventory
      const { error: insertError } = await supabase
        .from("player_vip_clothing")
        .insert({
          user_id: user.id,
          clothing_id: clothingId,
        });

      if (insertError) throw insertError;

      return clothing;
    },
    onSuccess: (clothing) => {
      queryClient.invalidateQueries({ queryKey: ["my-vip-clothing"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success(`${clothing.name} adquirido!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEquipVipClothing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ clothingId, type }: { clothingId: string | null; type: "shirt" | "pants" | "hair" }) => {
      if (!user) throw new Error("Não autenticado");

      const columnMap = {
        shirt: "vip_shirt_id",
        pants: "vip_pants_id",
        hair: "vip_hair_id",
      };

      const updateData: Record<string, string | null> = {
        [columnMap[type]]: clothingId,
      };

      const { error } = await supabase
        .from("characters")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update equipped status in player_vip_clothing
      if (clothingId) {
        // First unequip all of same type
        const { data: myClothes } = await supabase
          .from("player_vip_clothing")
          .select("id, clothing:vip_clothing(type)")
          .eq("user_id", user.id);

        if (myClothes) {
          for (const item of myClothes) {
            const itemType = (item.clothing as any)?.type;
            if (itemType === type) {
              await supabase
                .from("player_vip_clothing")
                .update({ is_equipped: item.id === clothingId })
                .eq("id", item.id);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["my-vip-clothing"] });
      toast.success("Visual atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEquippedVipClothing() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["equipped-vip-clothing", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: character, error } = await supabase
        .from("characters")
        .select("vip_shirt_id, vip_pants_id, vip_hair_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      const result: {
        shirt: VipClothing | null;
        pants: VipClothing | null;
        hair: VipClothing | null;
      } = {
        shirt: null,
        pants: null,
        hair: null,
      };

      if (character.vip_shirt_id) {
        const { data } = await supabase
          .from("vip_clothing")
          .select("*")
          .eq("id", character.vip_shirt_id)
          .single();
        result.shirt = data as VipClothing;
      }

      if (character.vip_pants_id) {
        const { data } = await supabase
          .from("vip_clothing")
          .select("*")
          .eq("id", character.vip_pants_id)
          .single();
        result.pants = data as VipClothing;
      }

      if (character.vip_hair_id) {
        const { data } = await supabase
          .from("vip_clothing")
          .select("*")
          .eq("id", character.vip_hair_id)
          .single();
        result.hair = data as VipClothing;
      }

      return result;
    },
    enabled: !!user,
  });
}
