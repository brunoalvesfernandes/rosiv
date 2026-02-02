import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Pet } from "./usePets";

interface Character {
  id: string;
  user_id: string;
  name: string;
  level: number;
  gold: number;
  strength: number;
  defense: number;
  vitality: number;
  agility: number;
  luck: number;
  current_xp: number;
  xp_to_next_level: number;
  is_banned: boolean;
  ban_reason: string | null;
  class: string | null;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["is_admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc("is_admin", { _user_id: user.id });
      
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user,
  });

  // Fetch all characters (admin only)
  const { data: allCharacters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: ["admin_characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .order("level", { ascending: false });
      
      if (error) throw error;
      return data as Character[];
    },
    enabled: isAdmin === true,
  });

  // Fetch all pets
  const { data: allPets, isLoading: isLoadingPets } = useQuery({
    queryKey: ["admin_pets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*");
      
      if (error) throw error;
      return data as Pet[];
    },
    enabled: isAdmin === true,
  });

  // Fetch admin logs
  const { data: adminLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["admin_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AdminLog[];
    },
    enabled: isAdmin === true,
  });

  // Log admin action helper
  const logAction = async (action: string, targetUserId: string | null, details: Record<string, unknown>) => {
    if (!user) return;
    
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action,
      target_user_id: targetUserId,
      details: details as unknown as Record<string, never>,
    } as { admin_id: string; action: string; target_user_id: string | null; details: Record<string, never> });
  };

  // Give gold to player
  const giveGold = useMutation({
    mutationFn: async ({ characterId, userId, amount }: { characterId: string; userId: string; amount: number }) => {
      const { data: character } = await supabase
        .from("characters")
        .select("gold")
        .eq("id", characterId)
        .single();
      
      if (!character) throw new Error("Personagem não encontrado");

      const { error } = await supabase
        .from("characters")
        .update({ gold: character.gold + amount })
        .eq("id", characterId);
      
      if (error) throw error;

      await logAction("give_gold", userId, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_characters"] });
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Ouro enviado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar ouro: " + error.message);
    },
  });

  // Set player level
  const setLevel = useMutation({
    mutationFn: async ({ characterId, userId, level }: { characterId: string; userId: string; level: number }) => {
      const { error } = await supabase
        .from("characters")
        .update({ 
          level,
          current_xp: 0,
          xp_to_next_level: level * 100,
        })
        .eq("id", characterId);
      
      if (error) throw error;

      await logAction("set_level", userId, { level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_characters"] });
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Nível alterado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao alterar nível: " + error.message);
    },
  });

  // Give pet to player
  const givePet = useMutation({
    mutationFn: async ({ userId, petId }: { userId: string; petId: string }) => {
      // Check if player already has this pet
      const { data: existing } = await supabase
        .from("player_pets")
        .select("id")
        .eq("user_id", userId)
        .eq("pet_id", petId)
        .single();
      
      if (existing) throw new Error("Jogador já possui este pet");

      const { error } = await supabase
        .from("player_pets")
        .insert({
          user_id: userId,
          pet_id: petId,
          is_active: false,
        });
      
      if (error) throw error;

      await logAction("give_pet", userId, { petId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Pet enviado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar pet: " + error.message);
    },
  });

  // Remove pet from player
  const removePet = useMutation({
    mutationFn: async ({ userId, petId }: { userId: string; petId: string }) => {
      const { error } = await supabase
        .from("player_pets")
        .delete()
        .eq("user_id", userId)
        .eq("pet_id", petId);
      
      if (error) throw error;

      await logAction("remove_pet", userId, { petId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Pet removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover pet: " + error.message);
    },
  });

  // Give item to player
  const giveItem = useMutation({
    mutationFn: async ({ userId, itemId, quantity }: { userId: string; itemId: string; quantity: number }) => {
      // Check if player already has this item
      const { data: existing } = await supabase
        .from("player_inventory")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .single();
      
      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from("player_inventory")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("player_inventory")
          .insert({
            user_id: userId,
            item_id: itemId,
            quantity,
          });
        
        if (error) throw error;
      }

      await logAction("give_item", userId, { itemId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Item enviado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar item: " + error.message);
    },
  });

  // Ban player
  const banPlayer = useMutation({
    mutationFn: async ({ characterId, userId, reason }: { characterId: string; userId: string; reason: string }) => {
      const { error } = await supabase
        .from("characters")
        .update({ 
          is_banned: true,
          ban_reason: reason,
          banned_at: new Date().toISOString(),
        })
        .eq("id", characterId);
      
      if (error) throw error;

      await logAction("ban_player", userId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_characters"] });
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Jogador banido!");
    },
    onError: (error) => {
      toast.error("Erro ao banir jogador: " + error.message);
    },
  });

  // Unban player
  const unbanPlayer = useMutation({
    mutationFn: async ({ characterId, userId }: { characterId: string; userId: string }) => {
      const { error } = await supabase
        .from("characters")
        .update({ 
          is_banned: false,
          ban_reason: null,
          banned_at: null,
        })
        .eq("id", characterId);
      
      if (error) throw error;

      await logAction("unban_player", userId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_characters"] });
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Jogador desbanido!");
    },
    onError: (error) => {
      toast.error("Erro ao desbanir jogador: " + error.message);
    },
  });

  // Add admin role to user
  const addAdmin = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: targetUserId,
          role: "admin",
        });
      
      if (error) throw error;

      await logAction("add_admin", targetUserId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Admin adicionado!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar admin: " + error.message);
    },
  });

  // Remove admin role from user
  const removeAdmin = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", "admin");
      
      if (error) throw error;

      await logAction("remove_admin", targetUserId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_logs"] });
      toast.success("Admin removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover admin: " + error.message);
    },
  });

  return {
    isAdmin,
    isCheckingAdmin,
    allCharacters,
    allPets,
    adminLogs,
    isLoading: isLoadingCharacters || isLoadingPets || isLoadingLogs,
    giveGold,
    setLevel,
    givePet,
    removePet,
    giveItem,
    banPlayer,
    unbanPlayer,
    addAdmin,
    removeAdmin,
  };
}
