import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PetFood {
  id: string;
  name: string;
  description: string;
  icon: string;
  hunger_restore: number;
  happiness_restore: number;
  price: number;
  rarity: string;
}

export interface PlayerPetFood {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  food?: PetFood;
}

export function usePetFeeding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available pet foods
  const { data: allFoods, isLoading: isLoadingFoods } = useQuery({
    queryKey: ["pet-foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_foods")
        .select("*")
        .order("price", { ascending: true });
      
      if (error) throw error;
      return data as PetFood[];
    },
  });

  // Fetch player's pet food inventory
  const { data: playerFoods, isLoading: isLoadingPlayerFoods } = useQuery({
    queryKey: ["player-pet-foods", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("player_pet_foods")
        .select(`
          *,
          food:pet_foods(*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as (PlayerPetFood & { food: PetFood })[];
    },
    enabled: !!user,
  });

  // Buy pet food
  const buyFood = useMutation({
    mutationFn: async ({ foodId, quantity = 1 }: { foodId: string; quantity?: number }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Get food price
      const { data: food, error: foodError } = await supabase
        .from("pet_foods")
        .select("price, name")
        .eq("id", foodId)
        .single();

      if (foodError) throw foodError;

      const totalCost = food.price * quantity;

      // Get player gold
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("gold")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      if (character.gold < totalCost) {
        throw new Error("Ouro insuficiente!");
      }

      // Deduct gold
      const { error: updateError } = await supabase
        .from("characters")
        .update({ gold: character.gold - totalCost })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Add food to inventory (upsert)
      const { data: existing } = await supabase
        .from("player_pet_foods")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("food_id", foodId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("player_pet_foods")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("player_pet_foods")
          .insert({ user_id: user.id, food_id: foodId, quantity });
        if (error) throw error;
      }

      return { name: food.name, quantity, cost: totalCost };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["player-pet-foods"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success(`Comprou ${data.quantity}x ${data.name} por ${data.cost} ouro!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Feed pet
  const feedPet = useMutation({
    mutationFn: async ({ playerPetId, foodId }: { playerPetId: string; foodId: string }) => {
      if (!user) throw new Error("Usuário não autenticado");

      // Get food from inventory
      const { data: playerFood, error: pfError } = await supabase
        .from("player_pet_foods")
        .select("id, quantity, food:pet_foods(*)")
        .eq("user_id", user.id)
        .eq("food_id", foodId)
        .single();

      if (pfError || !playerFood) {
        throw new Error("Você não tem essa comida!");
      }

      if (playerFood.quantity < 1) {
        throw new Error("Você não tem essa comida!");
      }

      const food = playerFood.food as PetFood;

      // Get pet current stats
      const { data: pet, error: petError } = await supabase
        .from("player_pets")
        .select("hunger, happiness")
        .eq("id", playerPetId)
        .eq("user_id", user.id)
        .single();

      if (petError) throw petError;

      // Update pet stats
      const newHunger = Math.min(100, (pet.hunger || 0) + food.hunger_restore);
      const newHappiness = Math.min(100, (pet.happiness || 0) + food.happiness_restore);

      const { error: updatePetError } = await supabase
        .from("player_pets")
        .update({ 
          hunger: newHunger, 
          happiness: newHappiness,
          last_fed: new Date().toISOString()
        })
        .eq("id", playerPetId)
        .eq("user_id", user.id);

      if (updatePetError) throw updatePetError;

      // Remove food from inventory
      if (playerFood.quantity === 1) {
        const { error } = await supabase
          .from("player_pet_foods")
          .delete()
          .eq("id", playerFood.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("player_pet_foods")
          .update({ quantity: playerFood.quantity - 1 })
          .eq("id", playerFood.id);
        if (error) throw error;
      }

      return { 
        foodName: food.name, 
        hungerRestored: food.hunger_restore,
        happinessRestored: food.happiness_restore 
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["player-pet-foods"] });
      queryClient.invalidateQueries({ queryKey: ["player_pets"] });
      toast.success(`Alimentou com ${data.foodName}! +${data.hungerRestored} fome, +${data.happinessRestored} felicidade`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    allFoods,
    playerFoods,
    isLoading: isLoadingFoods || isLoadingPlayerFoods,
    buyFood,
    feedPet,
  };
}

// Helper to get rarity color
export function getFoodRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "text-muted-foreground",
    uncommon: "text-green-500",
    rare: "text-blue-500",
    epic: "text-purple-500",
    legendary: "text-gold",
  };
  return colors[rarity] || "text-foreground";
}
