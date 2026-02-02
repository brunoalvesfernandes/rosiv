import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GuildWar {
  id: string;
  attacker_guild_id: string;
  defender_guild_id: string;
  attacker_score: number;
  defender_score: number;
  status: string;
  started_at: string;
  ends_at: string;
  winner_guild_id: string | null;
  gold_reward: number;
  xp_reward: number;
  attacker_guild_name?: string;
  defender_guild_name?: string;
}

export interface WarBattle {
  id: string;
  war_id: string;
  attacker_id: string;
  defender_id: string;
  winner_id: string | null;
  attacker_damage: number;
  defender_damage: number;
  created_at: string;
  attacker_name?: string;
  defender_name?: string;
}

export function useActiveWars() {
  return useQuery({
    queryKey: ["active-wars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guild_wars")
        .select("*")
        .eq("status", "active")
        .order("started_at", { ascending: false });

      if (error) throw error;

      // Get guild names
      const warsWithNames = await Promise.all(
        (data || []).map(async (war) => {
          const [attacker, defender] = await Promise.all([
            supabase.from("guilds").select("name").eq("id", war.attacker_guild_id).single(),
            supabase.from("guilds").select("name").eq("id", war.defender_guild_id).single(),
          ]);

          return {
            ...war,
            attacker_guild_name: attacker.data?.name || "Desconhecido",
            defender_guild_name: defender.data?.name || "Desconhecido",
          } as GuildWar;
        })
      );

      return warsWithNames;
    },
  });
}

export function useMyGuildWar(guildId: string | undefined) {
  return useQuery({
    queryKey: ["my-guild-war", guildId],
    queryFn: async () => {
      if (!guildId) return null;

      const { data, error } = await supabase
        .from("guild_wars")
        .select("*")
        .eq("status", "active")
        .or(`attacker_guild_id.eq.${guildId},defender_guild_id.eq.${guildId}`)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      const [attacker, defender] = await Promise.all([
        supabase.from("guilds").select("name").eq("id", data.attacker_guild_id).single(),
        supabase.from("guilds").select("name").eq("id", data.defender_guild_id).single(),
      ]);

      return {
        ...data,
        attacker_guild_name: attacker.data?.name || "Desconhecido",
        defender_guild_name: defender.data?.name || "Desconhecido",
      } as GuildWar;
    },
    enabled: !!guildId,
  });
}

export function useWarBattles(warId: string | undefined) {
  return useQuery({
    queryKey: ["war-battles", warId],
    queryFn: async () => {
      if (!warId) return [];

      const { data, error } = await supabase
        .from("war_battles")
        .select("*")
        .eq("war_id", warId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const battlesWithNames = await Promise.all(
        (data || []).map(async (battle) => {
          const [attacker, defender] = await Promise.all([
            supabase.from("characters").select("name").eq("user_id", battle.attacker_id).single(),
            supabase.from("characters").select("name").eq("user_id", battle.defender_id).single(),
          ]);

          return {
            ...battle,
            attacker_name: attacker.data?.name || "Desconhecido",
            defender_name: defender.data?.name || "Desconhecido",
          } as WarBattle;
        })
      );

      return battlesWithNames;
    },
    enabled: !!warId,
  });
}

export function useDeclareWar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      attackerGuildId,
      defenderGuildId,
    }: {
      attackerGuildId: string;
      defenderGuildId: string;
    }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if already in a war
      const { data: existingWar } = await supabase
        .from("guild_wars")
        .select("id")
        .eq("status", "active")
        .or(`attacker_guild_id.eq.${attackerGuildId},defender_guild_id.eq.${attackerGuildId}`)
        .single();

      if (existingWar) throw new Error("Sua guilda já está em guerra");

      const { data: defenderWar } = await supabase
        .from("guild_wars")
        .select("id")
        .eq("status", "active")
        .or(`attacker_guild_id.eq.${defenderGuildId},defender_guild_id.eq.${defenderGuildId}`)
        .single();

      if (defenderWar) throw new Error("A guilda alvo já está em guerra");

      const { error } = await supabase.from("guild_wars").insert({
        attacker_guild_id: attackerGuildId,
        defender_guild_id: defenderGuildId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-wars"] });
      queryClient.invalidateQueries({ queryKey: ["my-guild-war"] });
      toast.success("Guerra declarada!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useWarAttack() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      warId,
      defenderId,
      myGuildId,
      isAttacker,
    }: {
      warId: string;
      defenderId: string;
      myGuildId: string;
      isAttacker: boolean;
    }) => {
      if (!user) throw new Error("Não autenticado");

      // Get both characters
      const [myChar, enemyChar] = await Promise.all([
        supabase.from("characters").select("*").eq("user_id", user.id).single(),
        supabase.from("characters").select("*").eq("user_id", defenderId).single(),
      ]);

      if (!myChar.data || !enemyChar.data) throw new Error("Personagem não encontrado");

      if (myChar.data.current_energy < 10) {
        throw new Error("Energia insuficiente (10 necessários)");
      }

      // Calculate damage
      const myDamage = Math.floor(
        (myChar.data.strength * 2 + myChar.data.agility) * (0.8 + Math.random() * 0.4)
      );
      const enemyDamage = Math.floor(
        (enemyChar.data.strength * 2 + enemyChar.data.agility) * (0.8 + Math.random() * 0.4)
      );

      const iWon = myDamage > enemyDamage;
      const winnerId = iWon ? user.id : defenderId;

      // Deduct energy
      await supabase
        .from("characters")
        .update({ current_energy: myChar.data.current_energy - 10 })
        .eq("user_id", user.id);

      // Record battle
      await supabase.from("war_battles").insert({
        war_id: warId,
        attacker_id: user.id,
        defender_id: defenderId,
        winner_id: winnerId,
        attacker_damage: myDamage,
        defender_damage: enemyDamage,
      });

      // Update war score
      const scoreField = isAttacker ? "attacker_score" : "defender_score";
      const { data: war } = await supabase
        .from("guild_wars")
        .select("attacker_score, defender_score")
        .eq("id", warId)
        .single();

      if (war && iWon) {
        await supabase
          .from("guild_wars")
          .update({
            [scoreField]: isAttacker ? war.attacker_score + 1 : war.defender_score + 1,
          })
          .eq("id", warId);
      }

      return { won: iWon, myDamage, enemyDamage };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["my-guild-war"] });
      queryClient.invalidateQueries({ queryKey: ["war-battles"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      if (result.won) {
        toast.success(`Vitória! Você causou ${result.myDamage} de dano`);
      } else {
        toast.error(`Derrota! Inimigo causou ${result.enemyDamage} de dano`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
