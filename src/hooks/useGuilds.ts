import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  level: number;
  experience: number;
  max_members: number;
  gold_bank: number;
  icon: string | null;
  created_at: string;
  member_count?: number;
  leader_name?: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: "leader" | "officer" | "member";
  contribution: number;
  joined_at: string;
  character_name?: string;
  character_level?: number;
}

export interface GuildRequest {
  id: string;
  guild_id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: string;
  character_name?: string;
}

export function useGuilds() {
  return useQuery({
    queryKey: ["guilds"],
    queryFn: async () => {
      const { data: guilds, error } = await supabase
        .from("guilds")
        .select("*")
        .order("level", { ascending: false });

      if (error) throw error;

      // Get member counts and leader names
      const guildsWithDetails = await Promise.all(
        (guilds || []).map(async (guild) => {
          const { count } = await supabase
            .from("guild_members")
            .select("*", { count: "exact", head: true })
            .eq("guild_id", guild.id);

          const { data: leader } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", guild.leader_id)
            .single();

          return {
            ...guild,
            member_count: count || 0,
            leader_name: leader?.name || "Desconhecido",
          } as Guild;
        })
      );

      return guildsWithDetails;
    },
  });
}

export function useMyGuild() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-guild", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: membership, error: memberError } = await supabase
        .from("guild_members")
        .select("*, guilds(*)")
        .eq("user_id", user.id)
        .single();

      if (memberError) {
        if (memberError.code === "PGRST116") return null;
        throw memberError;
      }

      // Enrich with leader name
      if (membership?.guilds) {
        const guild = membership.guilds as Guild;
        const { data: leader } = await supabase
          .from("characters")
          .select("name")
          .eq("user_id", guild.leader_id)
          .single();

        (membership.guilds as Guild).leader_name = leader?.name || "Desconhecido";
      }

      return membership;
    },
    enabled: !!user,
  });
}

export function useGuildMembers(guildId: string | undefined) {
  return useQuery({
    queryKey: ["guild-members", guildId],
    queryFn: async () => {
      if (!guildId) return [];

      const { data: members, error } = await supabase
        .from("guild_members")
        .select("*")
        .eq("guild_id", guildId)
        .order("role", { ascending: true });

      if (error) throw error;

      // Get character info for each member
      const membersWithDetails = await Promise.all(
        (members || []).map(async (member) => {
          const { data: character } = await supabase
            .from("characters")
            .select("name, level")
            .eq("user_id", member.user_id)
            .single();

          return {
            ...member,
            character_name: character?.name || "Desconhecido",
            character_level: character?.level || 1,
          } as GuildMember;
        })
      );

      return membersWithDetails;
    },
    enabled: !!guildId,
  });
}

export function useGuildRequests(guildId: string | undefined) {
  return useQuery({
    queryKey: ["guild-requests", guildId],
    queryFn: async () => {
      if (!guildId) return [];

      const { data: requests, error } = await supabase
        .from("guild_requests")
        .select("*")
        .eq("guild_id", guildId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const requestsWithDetails = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", request.user_id)
            .single();

          return {
            ...request,
            character_name: character?.name || "Desconhecido",
          } as GuildRequest;
        })
      );

      return requestsWithDetails;
    },
    enabled: !!guildId,
  });
}

export function useCreateGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if already in a guild
      const { data: existing } = await supabase
        .from("guild_members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) throw new Error("Você já está em uma guilda");

      // Create the guild
      const { data: guild, error: guildError } = await supabase
        .from("guilds")
        .insert({
          name,
          description,
          leader_id: user.id,
        })
        .select()
        .single();

      if (guildError) {
        if (guildError.code === "23505") {
          throw new Error("Já existe uma guilda com esse nome");
        }
        throw guildError;
      }

      // Add leader as member
      const { error: memberError } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guild.id,
          user_id: user.id,
          role: "leader",
        });

      if (memberError) throw memberError;

      return guild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
      toast.success("Guilda criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRequestJoinGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ guildId, message }: { guildId: string; message?: string }) => {
      if (!user) throw new Error("Não autenticado");

      // Check if already in a guild
      const { data: existing } = await supabase
        .from("guild_members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) throw new Error("Você já está em uma guilda");

      const { error } = await supabase
        .from("guild_requests")
        .insert({
          guild_id: guildId,
          user_id: user.id,
          message,
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Você já enviou uma solicitação para esta guilda");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guild-requests"] });
      toast.success("Solicitação enviada!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, guildId, userId }: { requestId: string; guildId: string; userId: string }) => {
      // Add member
      const { error: memberError } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guildId,
          user_id: userId,
          role: "member",
        });

      if (memberError) throw memberError;

      // Update request status
      const { error: requestError } = await supabase
        .from("guild_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (requestError) throw requestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guild-members"] });
      queryClient.invalidateQueries({ queryKey: ["guild-requests"] });
      toast.success("Membro aceito!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("guild_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guild-requests"] });
      toast.success("Solicitação rejeitada");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLeaveGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error("Não autenticado");

      // Check if user is the leader
      const { data: guild } = await supabase
        .from("guilds")
        .select("leader_id")
        .eq("id", guildId)
        .single();

      if (guild?.leader_id === user.id) {
        // Delete the guild if leader leaves
        const { error } = await supabase
          .from("guilds")
          .delete()
          .eq("id", guildId);

        if (error) throw error;
      } else {
        // Just remove member
        const { error } = await supabase
          .from("guild_members")
          .delete()
          .eq("guild_id", guildId)
          .eq("user_id", user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
      queryClient.invalidateQueries({ queryKey: ["my-guild"] });
      queryClient.invalidateQueries({ queryKey: ["guild-members"] });
      toast.success("Você saiu da guilda");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useKickMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, guildId }: { memberId: string; guildId: string }) => {
      const { error } = await supabase
        .from("guild_members")
        .delete()
        .eq("id", memberId)
        .eq("guild_id", guildId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guild-members"] });
      toast.success("Membro removido");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePromoteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: "officer" | "member" }) => {
      const { error } = await supabase
        .from("guild_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guild-members"] });
      toast.success("Cargo atualizado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
