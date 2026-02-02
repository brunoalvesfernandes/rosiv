import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Character } from "./useCharacter";
import { generateMaterialDrops, formatDropMessage, MaterialDrop, Difficulty } from "@/utils/materialDrops";
export interface NPC {
  id: string;
  name: string;
  level: number;
  strength: number;
  defense: number;
  hp: number;
  xp_reward: number;
  gold_reward: number;
}

export interface BattleResult {
  won: boolean;
  damageDealt: number;
  damageTaken: number;
  xpGained: number;
  goldGained: number;
  arenaPointsChange: number;
  levelUp: boolean;
  newLevel: number;
  drops: MaterialDrop[];
}
export function useNPCs() {
  return useQuery({
    queryKey: ["npcs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("npcs")
        .select("*")
        .order("level", { ascending: true });

      if (error) throw error;
      return data as NPC[];
    },
  });
}

function calculateDamage(attackerStrength: number, defenderDefense: number): number {
  const baseDamage = attackerStrength * 2;
  const reduction = defenderDefense * 0.5;
  const damage = Math.max(1, baseDamage - reduction);
  // Add some randomness (±20%)
  const variance = damage * 0.2;
  return Math.floor(damage + (Math.random() * variance * 2 - variance));
}

function calculateWinChance(
  attackerStrength: number,
  attackerDefense: number,
  attackerAgility: number,
  attackerLuck: number,
  defenderStrength: number,
  defenderDefense: number
): number {
  const attackerPower = attackerStrength * 3 + attackerDefense * 2 + attackerAgility + attackerLuck;
  const defenderPower = defenderStrength * 3 + defenderDefense * 2;
  
  const ratio = attackerPower / (attackerPower + defenderPower);
  return Math.min(95, Math.max(5, Math.floor(ratio * 100)));
}

export function useAttackNPC() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (npc: NPC): Promise<BattleResult> => {
      if (!user) throw new Error("Not authenticated");

      // Get character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      if (character.current_hp <= 0) {
        throw new Error("Você está sem vida! Descanse primeiro.");
      }

      // Calculate battle
      const playerDamage = calculateDamage(character.strength, npc.defense);
      const npcDamage = calculateDamage(npc.strength, character.defense);
      
      const playerTotalDamage = playerDamage * Math.ceil(npc.hp / playerDamage);
      const npcTotalDamage = npcDamage * Math.ceil(character.current_hp / npcDamage);
      
      // Simple battle simulation
      let playerHp = character.current_hp;
      let npcHp = npc.hp;
      let rounds = 0;
      const maxRounds = 20;

      while (playerHp > 0 && npcHp > 0 && rounds < maxRounds) {
        // Player attacks first (agility advantage)
        if (character.agility >= npc.level) {
          npcHp -= calculateDamage(character.strength, npc.defense);
          if (npcHp <= 0) break;
          playerHp -= calculateDamage(npc.strength, character.defense);
        } else {
          playerHp -= calculateDamage(npc.strength, character.defense);
          if (playerHp <= 0) break;
          npcHp -= calculateDamage(character.strength, npc.defense);
        }
        rounds++;
      }

      const won = npcHp <= 0;
      const damageDealt = npc.hp - Math.max(0, npcHp);
      const damageTaken = character.current_hp - Math.max(0, playerHp);

      // Calculate rewards
      const xpGained = won ? npc.xp_reward : Math.floor(npc.xp_reward * 0.1);
      const goldGained = won ? npc.gold_reward : 0;

      // Update character
      const newHp = Math.max(0, character.current_hp - damageTaken);
      const newXp = character.current_xp + xpGained;
      const newGold = character.gold + goldGained;
      
      let newLevel = character.level;
      let xpToNext = character.xp_to_next_level;
      let availablePoints = character.available_points;
      let remainingXp = newXp;

      // Level up check
      while (remainingXp >= xpToNext) {
        remainingXp -= xpToNext;
        newLevel++;
        availablePoints += 5;
        xpToNext = Math.floor(xpToNext * 1.5);
      }

      await supabase
        .from("characters")
        .update({
          current_hp: newHp,
          current_xp: remainingXp,
          xp_to_next_level: xpToNext,
          gold: newGold,
          level: newLevel,
          available_points: availablePoints,
          total_battles: character.total_battles + 1,
          wins: won ? character.wins + 1 : character.wins,
        })
        .eq("user_id", user.id);

      // Log battle
      await supabase.from("battle_logs").insert({
        attacker_id: user.id,
        defender_npc_name: npc.name,
        is_pvp: false,
        winner_id: won ? user.id : null,
        attacker_damage: damageDealt,
        defender_damage: damageTaken,
        xp_gained: xpGained,
        gold_gained: goldGained,
      });

      // Generate material drops if won
      let drops: MaterialDrop[] = [];
      if (won) {
        // Determine difficulty based on NPC level relative to player
        const levelDiff = npc.level - character.level;
        let difficulty: Difficulty = "medium";
        if (levelDiff <= -3) difficulty = "easy";
        else if (levelDiff >= 3) difficulty = "hard";
        else if (levelDiff >= 5) difficulty = "boss";
        
        drops = await generateMaterialDrops(user.id, "arena_npc", difficulty);
      }

      return {
        won,
        damageDealt,
        damageTaken,
        xpGained,
        goldGained,
        arenaPointsChange: 0,
        levelUp: newLevel > character.level,
        newLevel,
        drops,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
      
      if (result.won) {
        if (result.levelUp) {
          toast.success(`⚔️ Vitória! Subiu para nível ${result.newLevel}!`);
        } else {
          toast.success(`⚔️ Vitória! +${result.xpGained} XP, +${result.goldGained} ouro`);
        }
        if (result.drops.length > 0) {
          toast.success(formatDropMessage(result.drops), { duration: 5000 });
        }
      } else {
        toast.error(`💀 Derrota! Você foi derrotado. +${result.xpGained} XP`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAttackPlayer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (opponent: Character): Promise<BattleResult> => {
      if (!user) throw new Error("Not authenticated");

      // Get attacker character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (charError) throw charError;

      if (character.current_hp <= 0) {
        throw new Error("Você está sem vida! Descanse primeiro.");
      }

      // Check protection
      if (opponent.is_protected && new Date(opponent.protection_until || "") > new Date()) {
        throw new Error("Este jogador está protegido!");
      }

      // Calculate win chance and simulate battle
      const winChance = calculateWinChance(
        character.strength,
        character.defense,
        character.agility,
        character.luck,
        opponent.strength,
        opponent.defense
      );

      const roll = Math.random() * 100;
      const won = roll <= winChance;

      const damageDealt = calculateDamage(character.strength, opponent.defense);
      const damageTaken = calculateDamage(opponent.strength, character.defense);

      // Calculate arena points change
      const levelDiff = opponent.level - character.level;
      const basePoints = 10 + levelDiff * 2;
      const arenaPointsChange = won ? Math.max(5, basePoints) : -Math.max(3, Math.floor(basePoints / 2));

      // XP and gold for PvP
      const xpGained = won ? Math.floor(50 + opponent.level * 10) : 10;
      const goldGained = won ? Math.floor(20 + opponent.level * 5) : 0;

      // Update attacker
      const newHp = Math.max(0, character.current_hp - damageTaken);
      const newXp = character.current_xp + xpGained;
      const newGold = character.gold + goldGained;
      const newArenaPoints = Math.max(0, character.arena_points + arenaPointsChange);

      let newLevel = character.level;
      let xpToNext = character.xp_to_next_level;
      let availablePoints = character.available_points;
      let remainingXp = newXp;

      while (remainingXp >= xpToNext) {
        remainingXp -= xpToNext;
        newLevel++;
        availablePoints += 5;
        xpToNext = Math.floor(xpToNext * 1.5);
      }

      await supabase
        .from("characters")
        .update({
          current_hp: newHp,
          current_xp: remainingXp,
          xp_to_next_level: xpToNext,
          gold: newGold,
          level: newLevel,
          available_points: availablePoints,
          total_battles: character.total_battles + 1,
          wins: won ? character.wins + 1 : character.wins,
          arena_points: newArenaPoints,
        })
        .eq("user_id", user.id);

      // Update defender (take some damage and lose/gain arena points)
      await supabase
        .from("characters")
        .update({
          current_hp: Math.max(0, opponent.current_hp - (won ? damageDealt : 0)),
          arena_points: Math.max(0, opponent.arena_points - arenaPointsChange),
        })
        .eq("user_id", opponent.user_id);

      // Log battle
      await supabase.from("battle_logs").insert({
        attacker_id: user.id,
        defender_id: opponent.user_id,
        is_pvp: true,
        winner_id: won ? user.id : opponent.user_id,
        attacker_damage: damageDealt,
        defender_damage: damageTaken,
        xp_gained: xpGained,
        gold_gained: goldGained,
        arena_points_change: arenaPointsChange,
      });

      // Generate material drops if won
      let drops: MaterialDrop[] = [];
      if (won) {
        // Determine difficulty based on opponent level relative to player
        const levelDiff = opponent.level - character.level;
        let difficulty: Difficulty = "medium";
        if (levelDiff <= -3) difficulty = "easy";
        else if (levelDiff >= 3) difficulty = "hard";
        else if (levelDiff >= 5) difficulty = "boss";
        
        drops = await generateMaterialDrops(user.id, "arena_pvp", difficulty);
      }

      return {
        won,
        damageDealt,
        damageTaken,
        xpGained,
        goldGained,
        arenaPointsChange,
        levelUp: newLevel > character.level,
        newLevel,
        drops,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["arena-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });

      if (result.won) {
        toast.success(`⚔️ Vitória PvP! +${result.arenaPointsChange} pontos de arena`);
        if (result.drops.length > 0) {
          toast.success(formatDropMessage(result.drops), { duration: 5000 });
        }
      } else {
        toast.error(`💀 Derrota PvP! ${result.arenaPointsChange} pontos de arena`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export { calculateWinChance };
