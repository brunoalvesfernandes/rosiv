import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateMaterialDrops, formatDropMessage, Difficulty } from "@/utils/materialDrops";
export interface Dungeon {
  id: string;
  name: string;
  description: string;
  min_players: number;
  max_players: number;
  boss_name: string;
  boss_hp: number;
  boss_strength: number;
  boss_defense: number;
  gold_reward: number;
  xp_reward: number;
  min_level: number;
  duration_minutes: number;
  icon: string | null;
}

export interface DungeonRun {
  id: string;
  dungeon_id: string;
  created_by: string;
  started_at: string | null;
  ends_at: string | null;
  status: string;
  current_boss_hp: number;
  created_at: string;
  dungeon?: Dungeon;
  participants?: DungeonParticipant[];
}

export interface DungeonParticipant {
  id: string;
  run_id: string;
  user_id: string;
  damage_dealt: number;
  is_ready: boolean;
  joined_at: string;
  character_name?: string;
}

export function useDungeons() {
  return useQuery({
    queryKey: ["dungeons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dungeons")
        .select("*")
        .order("min_level", { ascending: true });

      if (error) throw error;
      return data as Dungeon[];
    },
  });
}

export function useAvailableRuns() {
  const [runs, setRuns] = useState<DungeonRun[]>([]);

  const { data: initialRuns, isLoading } = useQuery({
    queryKey: ["dungeon-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dungeon_runs")
        .select("*")
        .in("status", ["waiting", "active"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch dungeon details and participants for each run
      const runsWithDetails = await Promise.all(
        (data || []).map(async (run) => {
          const [dungeonRes, participantsRes] = await Promise.all([
            supabase.from("dungeons").select("*").eq("id", run.dungeon_id).single(),
            supabase.from("dungeon_participants").select("*").eq("run_id", run.id),
          ]);

          // Get character names for participants
          const participantsWithNames = await Promise.all(
            (participantsRes.data || []).map(async (p) => {
              const { data: char } = await supabase
                .from("characters")
                .select("name")
                .eq("user_id", p.user_id)
                .single();
              return { ...p, character_name: char?.name || "Desconhecido" };
            })
          );

          return {
            ...run,
            dungeon: dungeonRes.data as Dungeon,
            participants: participantsWithNames,
          };
        })
      );

      return runsWithDetails;
    },
  });

  useEffect(() => {
    if (initialRuns) {
      setRuns(initialRuns);
    }
  }, [initialRuns]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("dungeon-runs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dungeon_runs" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setRuns((prev) => prev.filter((r) => r.id !== payload.old.id));
          } else {
            // Refetch to get full details
            const { data } = await supabase
              .from("dungeon_runs")
              .select("*")
              .eq("id", payload.new.id)
              .single();

            if (data) {
              const [dungeonRes, participantsRes] = await Promise.all([
                supabase.from("dungeons").select("*").eq("id", data.dungeon_id).single(),
                supabase.from("dungeon_participants").select("*").eq("run_id", data.id),
              ]);

              const participantsWithNames = await Promise.all(
                (participantsRes.data || []).map(async (p) => {
                  const { data: char } = await supabase
                    .from("characters")
                    .select("name")
                    .eq("user_id", p.user_id)
                    .single();
                  return { ...p, character_name: char?.name || "Desconhecido" };
                })
              );

              const fullRun = {
                ...data,
                dungeon: dungeonRes.data as Dungeon,
                participants: participantsWithNames,
              };

              setRuns((prev) => {
                const exists = prev.find((r) => r.id === data.id);
                if (exists) {
                  return prev.map((r) => (r.id === data.id ? fullRun : r));
                }
                return [fullRun, ...prev];
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dungeon_participants" },
        async (payload) => {
          const newPayload = payload.new as { run_id?: string } | undefined;
          const oldPayload = payload.old as { run_id?: string } | undefined;
          const runId = newPayload?.run_id || oldPayload?.run_id;
          if (!runId) return;

          // Refetch participants for this run
          const { data: participants } = await supabase
            .from("dungeon_participants")
            .select("*")
            .eq("run_id", runId);

          const participantsWithNames = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: char } = await supabase
                .from("characters")
                .select("name")
                .eq("user_id", p.user_id)
                .single();
              return { ...p, character_name: char?.name || "Desconhecido" };
            })
          );

          setRuns((prev) =>
            prev.map((r) =>
              r.id === runId ? { ...r, participants: participantsWithNames } : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { runs, isLoading };
}

export function useCreateRun() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dungeon: Dungeon) => {
      if (!user) throw new Error("Não autenticado");

      // Create the run
      const { data: run, error: runError } = await supabase
        .from("dungeon_runs")
        .insert({
          dungeon_id: dungeon.id,
          created_by: user.id,
          current_boss_hp: dungeon.boss_hp,
          status: "waiting",
        })
        .select()
        .single();

      if (runError) throw runError;

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from("dungeon_participants")
        .insert({
          run_id: run.id,
          user_id: user.id,
          is_ready: true,
        });

      if (participantError) throw participantError;

      return run;
    },
    onSuccess: () => {
      toast.success("Masmorra criada! Aguardando jogadores...");
      queryClient.invalidateQueries({ queryKey: ["dungeon-runs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useJoinRun() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("dungeon_participants").insert({
        run_id: runId,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Você entrou na masmorra!");
      queryClient.invalidateQueries({ queryKey: ["dungeon-runs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLeaveRun() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("dungeon_participants")
        .delete()
        .eq("run_id", runId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Você saiu da masmorra");
      queryClient.invalidateQueries({ queryKey: ["dungeon-runs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSetReady() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ runId, isReady }: { runId: string; isReady: boolean }) => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("dungeon_participants")
        .update({ is_ready: isReady })
        .eq("run_id", runId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dungeon-runs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useStartRun() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ runId, durationMinutes }: { runId: string; durationMinutes: number }) => {
    if (!user) throw new Error("Não autenticado");
  
    const { data: participants, error: partError } = await supabase
      .from("dungeon_participants")
      .select("is_ready")
      .eq("run_id", runId);
  
    if (partError) throw partError;
  
    if (!participants || participants.length < 1) {
      throw new Error("Nenhum participante encontrado");
    }
  
    const allReady = participants.every((p) => p.is_ready);
    if (!allReady) {
      throw new Error("Nem todos os jogadores estão prontos!");
    }
  
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  
    console.log("[useStartRun] Starting run", { runId, userId: user.id, durationMinutes });
  
    const { data: updatedRuns, error } = await supabase
      .from("dungeon_runs")
      .update({
        status: "active",
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .eq("id", runId)
      .eq("status", "waiting")
      .select("id");
  
    console.log("[useStartRun] Update result", { updatedRuns, error });
  
    if (error) throw error;
  
    // Se não atualizou nada, pode ser porque já estava active (ou bloqueado por RLS)
    if (!updatedRuns || updatedRuns.length === 0) {
      const { data: existingRun, error: fetchError } = await supabase
        .from("dungeon_runs")
        .select("status")
        .eq("id", runId)
        .single();
  
      console.log("[useStartRun] Fetched existing run", { existingRun, fetchError });
  
      if (fetchError) throw fetchError;
  
      if (existingRun?.status === "active") {
        return { started: true };
      }
  
      throw new Error("Não foi possível iniciar a masmorra.");
    }
  
    return { started: true };
  },
  });
}

export function useAttackBoss() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ run, dungeon }: { run: DungeonRun; dungeon: Dungeon }) => {
      if (!user) throw new Error("Não autenticado");

      // Get current character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (charError || !character) throw new Error("Personagem não encontrado");
      if (character.current_energy < 5) throw new Error("Energia insuficiente (5 necessário)");
      if (character.current_hp <= 0) throw new Error("Você está sem vida para atacar.");

      // Ensure participant exists
      const { data: participant, error: participantError } = await supabase
        .from("dungeon_participants")
        .select("damage_dealt")
        .eq("run_id", run.id)
        .eq("user_id", user.id)
        .single();

      if (participantError || !participant) throw new Error("Você não está participando desta masmorra.");

      // Load current run state to avoid stale HP
      const { data: currentRun, error: currentRunError } = await supabase
        .from("dungeon_runs")
        .select("current_boss_hp, status")
        .eq("id", run.id)
        .single();

      if (currentRunError || !currentRun) throw currentRunError || new Error("Masmorra não encontrada.");
      if (currentRun.status !== "active") throw new Error("A masmorra não está em combate.");
      if (currentRun.current_boss_hp <= 0) throw new Error("O boss já foi derrotado.");

      // Calculate damage
      const baseDamage = character.strength * 2;
      const variance = Math.floor(Math.random() * 10) - 5;
      const damage = Math.max(1, Math.floor(baseDamage - dungeon.boss_defense / 2 + variance));

      let resolvedBossHp: number | undefined;
      let attemptHp = currentRun.current_boss_hp;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const nextBossHp = Math.max(0, attemptHp - damage);
        const { data: bossUpdate, error: bossUpdateError } = await supabase
          .from("dungeon_runs")
          .update({ current_boss_hp: nextBossHp })
          .eq("id", run.id)
          .eq("current_boss_hp", attemptHp)
          .select("current_boss_hp");

        if (bossUpdateError) throw bossUpdateError;

        const updatedHp = bossUpdate?.[0]?.current_boss_hp;
        if (updatedHp !== undefined) {
          resolvedBossHp = updatedHp;
          break;
        }

        const { data: refreshedRun, error: refreshedError } = await supabase
          .from("dungeon_runs")
          .select("current_boss_hp")
          .eq("id", run.id)
          .single();

        if (refreshedError) throw refreshedError;
        if (!refreshedRun) throw new Error("Não foi possível atualizar o HP do boss.");

        attemptHp = refreshedRun.current_boss_hp;
      }

      if (resolvedBossHp === undefined) {
        throw new Error("Não foi possível atualizar o HP do boss.");
      }

      const { error: updateParticipantError } = await supabase
        .from("dungeon_participants")
        .update({ damage_dealt: participant.damage_dealt + damage })
        .eq("run_id", run.id)
        .eq("user_id", user.id);

      if (updateParticipantError) throw updateParticipantError;

      // Update boss HP
      const { data: bossUpdate, error: bossUpdateError } = await supabase
        .from("dungeon_runs")
        .update({ current_boss_hp: newBossHp })
        .eq("id", run.id)
        .select("current_boss_hp");

      if (bossUpdateError) throw bossUpdateError;
      let resolvedBossHp = bossUpdate?.[0]?.current_boss_hp;
      if (resolvedBossHp === undefined) {
        const { data: currentRun, error: currentRunError } = await supabase
          .from("dungeon_runs")
          .select("current_boss_hp")
          .eq("id", run.id)
          .single();

        if (currentRunError) throw currentRunError;

        if (currentRun?.current_boss_hp === undefined) {
          throw new Error("Não foi possível atualizar o HP do boss.");
        }

        if (currentRun.current_boss_hp >= run.current_boss_hp) {
          throw new Error("Não foi possível atualizar o HP do boss.");
        }

        resolvedBossHp = currentRun.current_boss_hp;
      }

      // Consume energy
      const { error: energyError } = await supabase
        .from("characters")
        .update({ current_energy: character.current_energy - 5 })
        .eq("user_id", user.id);

      if (energyError) throw energyError;

      // Boss counterattack
      const bossBaseDamage = dungeon.boss_strength;
      const defenseMitigation = character.defense / 3;
      const bossVariance = Math.floor(Math.random() * 6) - 3;
      const damageTaken = Math.max(1, Math.floor(bossBaseDamage - defenseMitigation + bossVariance));
      const newPlayerHp = Math.max(0, character.current_hp - damageTaken);

      const { error: hpError } = await supabase
        .from("characters")
        .update({ current_hp: newPlayerHp })
        .eq("user_id", user.id);

      if (hpError) throw hpError;

      // Check if boss is defeated
      if (resolvedBossHp <= 0) {
        // Mark run as completed
        await supabase
          .from("dungeon_runs")
          .update({ status: "completed" })
          .eq("id", run.id);

        // Get all participants
        const { data: participants } = await supabase
          .from("dungeon_participants")
          .select("user_id, damage_dealt")
          .eq("run_id", run.id);

        // Distribute rewards based on damage dealt
        const totalDamage = participants?.reduce((sum, p) => sum + p.damage_dealt, 0) || 1;

        // Determine dungeon difficulty based on min_level
        let difficulty: Difficulty = "medium";
        if (dungeon.min_level >= 15) difficulty = "boss";
        else if (dungeon.min_level >= 10) difficulty = "hard";
        else if (dungeon.min_level >= 5) difficulty = "medium";
        else difficulty = "easy";

        for (const p of participants || []) {
          const damageShare = p.damage_dealt / totalDamage;
          const goldShare = Math.floor(dungeon.gold_reward * damageShare);
          const xpShare = Math.floor(dungeon.xp_reward * damageShare);

          // Get current character stats
          const { data: char } = await supabase
            .from("characters")
            .select("gold, current_xp")
            .eq("user_id", p.user_id)
            .single();

          if (char) {
            await supabase
              .from("characters")
              .update({
                gold: char.gold + goldShare,
                current_xp: char.current_xp + xpShare,
              })
              .eq("user_id", p.user_id);
          }

          // Generate material drops for each participant
          await generateMaterialDrops(p.user_id, "dungeon", difficulty);
        }

        // Generate drops for the current user and show message
        const drops = await generateMaterialDrops(user.id, "dungeon", difficulty);

        return { damage, damageTaken, defeated: true, gold: dungeon.gold_reward, xp: dungeon.xp_reward, drops };
      }

      return { damage, damageTaken, defeated: false, drops: [] };
    },
    onSuccess: (result) => {
      if (result.defeated) {
        toast.success(`Boss derrotado! Recompensas distribuídas!`);
        if (result.drops && result.drops.length > 0) {
          toast.success(formatDropMessage(result.drops), { duration: 5000 });
        }
      } else {
        toast.success(`Você causou ${result.damage} de dano ao boss!`);
      }
      if (result.damageTaken) {
        toast.error(`Você recebeu ${result.damageTaken} de dano!`);
      }
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["dungeon-runs"] });
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
