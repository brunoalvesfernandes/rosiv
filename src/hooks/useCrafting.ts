import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Material {
  id: string;
  name: string;
  description: string;
  rarity: string;
  icon: string | null;
  drop_source: string;
}

export interface PlayerMaterial {
  id: string;
  user_id: string;
  material_id: string;
  quantity: number;
  material?: Material;
}

export interface RecipeMaterial {
  id: string;
  recipe_id: string;
  material_id: string;
  quantity_required: number;
  material?: Material;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  result_item_id: string;
  crafting_time_minutes: number;
  required_level: number;
  icon: string | null;
  materials?: RecipeMaterial[];
  result_item?: {
    id: string;
    name: string;
    description: string;
    rarity: string;
    icon: string | null;
  };
}

export function useMaterials() {
  return useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("rarity", { ascending: true });

      if (error) throw error;
      return data as Material[];
    },
  });
}

export function usePlayerMaterials() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["player-materials", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("player_materials")
        .select("*, material:materials(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((pm) => ({
        ...pm,
        material: pm.material as Material,
      })) as PlayerMaterial[];
    },
    enabled: !!user,
  });
}

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      // Get all recipes
      const { data: recipes, error: recipesError } = await supabase
        .from("recipes")
        .select("*")
        .order("required_level", { ascending: true });

      if (recipesError) throw recipesError;

      // Get recipe materials with material details
      const { data: recipeMaterials, error: materialsError } = await supabase
        .from("recipe_materials")
        .select("*, material:materials(*)");

      if (materialsError) throw materialsError;

      // Get result items
      const itemIds = recipes.map((r) => r.result_item_id);
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("id, name, description, rarity, icon")
        .in("id", itemIds);

      if (itemsError) throw itemsError;

      // Map everything together
      return recipes.map((recipe) => ({
        ...recipe,
        materials: recipeMaterials
          .filter((rm) => rm.recipe_id === recipe.id)
          .map((rm) => ({
            ...rm,
            material: rm.material as Material,
          })),
        result_item: items.find((i) => i.id === recipe.result_item_id),
      })) as Recipe[];
    },
  });
}

export function useCraftItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: Recipe) => {
      if (!user) throw new Error("Não autenticado");

      // Get player's materials
      const { data: playerMaterials, error: pmError } = await supabase
        .from("player_materials")
        .select("*")
        .eq("user_id", user.id);

      if (pmError) throw pmError;

      // Check if player has enough materials
      for (const rm of recipe.materials || []) {
        const pm = playerMaterials.find((p) => p.material_id === rm.material_id);
        if (!pm || pm.quantity < rm.quantity_required) {
          throw new Error(`Material insuficiente: ${rm.material?.name}`);
        }
      }

      // Deduct materials
      for (const rm of recipe.materials || []) {
        const pm = playerMaterials.find((p) => p.material_id === rm.material_id)!;
        const newQuantity = pm.quantity - rm.quantity_required;

        await supabase
          .from("player_materials")
          .update({ quantity: newQuantity })
          .eq("id", pm.id);
      }

      // Add crafted item to inventory
      const { data: existingItem } = await supabase
        .from("player_inventory")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", recipe.result_item_id)
        .single();

      if (existingItem) {
        await supabase
          .from("player_inventory")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
      } else {
        await supabase.from("player_inventory").insert({
          user_id: user.id,
          item_id: recipe.result_item_id,
          quantity: 1,
        });
      }

      return recipe.result_item;
    },
    onSuccess: (item) => {
      toast.success(`Você criou: ${item?.name}!`);
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility to add materials to player (for testing/rewards)
export function useAddMaterial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ materialId, quantity }: { materialId: string; quantity: number }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if player already has this material
      const { data: existing } = await supabase
        .from("player_materials")
        .select("*")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .single();

      if (existing) {
        await supabase
          .from("player_materials")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
      } else {
        await supabase.from("player_materials").insert({
          user_id: user.id,
          material_id: materialId,
          quantity,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
