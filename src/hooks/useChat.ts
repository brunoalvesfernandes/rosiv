import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  user_id: string;
  guild_id: string | null;
  message: string;
  is_global: boolean;
  created_at: string;
  sender_name?: string;
}

export function useGlobalChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch initial messages
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["global-chat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("is_global", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get sender names
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", msg.user_id)
            .single();
          return { ...msg, sender_name: character?.name || "Desconhecido" };
        })
      );

      return messagesWithNames.reverse();
    },
  });

  // Set initial messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "is_global=eq.true",
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", newMessage.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, sender_name: character?.name || "Desconhecido" },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        message,
        is_global: true,
      });

      if (error) throw error;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
}

export function useGuildChat(guildId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["guild-chat", guildId],
    queryFn: async () => {
      if (!guildId) return [];

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("guild_id", guildId)
        .eq("is_global", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", msg.user_id)
            .single();
          return { ...msg, sender_name: character?.name || "Desconhecido" };
        })
      );

      return messagesWithNames.reverse();
    },
    enabled: !!guildId,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!guildId) return;

    const channel = supabase
      .channel(`guild-chat-${guildId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `guild_id=eq.${guildId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", newMessage.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, sender_name: character?.name || "Desconhecido" },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guildId]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user || !guildId) throw new Error("Não autenticado ou sem guilda");

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        guild_id: guildId,
        message,
        is_global: false,
      });

      if (error) throw error;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
