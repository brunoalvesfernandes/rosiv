import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playNotificationSound } from "@/utils/notificationSound";

export interface ChatMessage {
  id: string;
  user_id: string;
  guild_id: string | null;
  message: string;
  is_global: boolean;
  created_at: string;
  sender_name?: string;
}

export function useGlobalChat(isChatOpen: boolean = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenRef = useRef<string | null>(null);

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
      // Set last seen to most recent message
      if (initialMessages.length > 0) {
        lastSeenRef.current = initialMessages[initialMessages.length - 1].id;
      }
    }
  }, [initialMessages]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      setUnreadCount(0);
      lastSeenRef.current = messages[messages.length - 1].id;
    }
  }, [isChatOpen, messages]);

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
          
          // Don't notify for own messages
          const isOwnMessage = newMessage.user_id === user?.id;
          
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", newMessage.user_id)
            .single();

          const messageWithName = { ...newMessage, sender_name: character?.name || "Desconhecido" };

          setMessages((prev) => [...prev, messageWithName]);
          
          // Update unread count and play sound if chat is closed and not own message
          if (!isChatOpen && !isOwnMessage) {
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isChatOpen]);


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

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
    if (messages.length > 0) {
      lastSeenRef.current = messages[messages.length - 1].id;
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    unreadCount,
    clearUnread,
  };
}

export function useGuildChat(guildId: string | undefined, isChatOpen: boolean = false) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenRef = useRef<string | null>(null);

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
      if (initialMessages.length > 0) {
        lastSeenRef.current = initialMessages[initialMessages.length - 1].id;
      }
    }
  }, [initialMessages]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
      setUnreadCount(0);
      lastSeenRef.current = messages[messages.length - 1].id;
    }
  }, [isChatOpen, messages]);

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
          
          // Don't notify for own messages
          const isOwnMessage = newMessage.user_id === user?.id;
          
          const { data: character } = await supabase
            .from("characters")
            .select("name")
            .eq("user_id", newMessage.user_id)
            .single();

          const messageWithName = { ...newMessage, sender_name: character?.name || "Desconhecido" };

          setMessages((prev) => [...prev, messageWithName]);
          
          // Update unread count and play sound if chat is closed and not own message
          if (!isChatOpen && !isOwnMessage) {
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guildId, user?.id, isChatOpen]);

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

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
    if (messages.length > 0) {
      lastSeenRef.current = messages[messages.length - 1].id;
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    unreadCount,
    clearUnread,
  };
}
