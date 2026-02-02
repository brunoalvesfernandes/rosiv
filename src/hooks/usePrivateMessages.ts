import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playNotificationSound } from "@/utils/notificationSound";

export interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
  // Avatar appearance
  hair_style?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  face_style?: string;
  accessory?: string | null;
  level?: number;
}

export interface Conversation {
  partner_id: string;
  partner_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  // Avatar
  hair_style?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  face_style?: string;
  accessory?: string | null;
  level?: number;
}

const MESSAGE_MAX_LENGTH = 500;

export function usePrivateMessages(partnerId?: string, isOpen: boolean = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const lastSeenRef = useRef<string | null>(null);

  // Fetch messages for a specific conversation
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["private-messages", partnerId],
    queryFn: async () => {
      if (!partnerId || !user) return [];

      const { data, error } = await supabase
        .from("private_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get sender info for all messages
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: character } = await supabase
            .from("characters")
            .select("name, hair_style, hair_color, eye_color, skin_tone, face_style, accessory, level")
            .eq("user_id", msg.sender_id)
            .single();

          return {
            ...msg,
            sender_name: character?.name || "Desconhecido",
            hair_style: character?.hair_style,
            hair_color: character?.hair_color,
            eye_color: character?.eye_color,
            skin_tone: character?.skin_tone,
            face_style: character?.face_style,
            accessory: character?.accessory,
            level: character?.level,
          };
        })
      );

      return messagesWithNames.reverse();
    },
    enabled: !!partnerId && !!user,
  });

  // Set initial messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      if (initialMessages.length > 0) {
        lastSeenRef.current = initialMessages[initialMessages.length - 1].id;
      }
    }
  }, [initialMessages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (isOpen && partnerId && user && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => msg.receiver_id === user.id && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        supabase
          .from("private_messages")
          .update({ is_read: true })
          .in("id", unreadMessages.map((m) => m.id))
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          });
      }
    }
  }, [isOpen, partnerId, user, messages, queryClient]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!partnerId || !user) return;

    const channel = supabase
      .channel(`private-chat-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        async (payload) => {
          const newMessage = payload.new as PrivateMessage;

          // Only process if it's our conversation
          const isOurConversation =
            (newMessage.sender_id === user.id && newMessage.receiver_id === partnerId) ||
            (newMessage.sender_id === partnerId && newMessage.receiver_id === user.id);

          if (!isOurConversation) return;

          const { data: character } = await supabase
            .from("characters")
            .select("name, hair_style, hair_color, eye_color, skin_tone, face_style, accessory, level")
            .eq("user_id", newMessage.sender_id)
            .single();

          const messageWithName = {
            ...newMessage,
            sender_name: character?.name || "Desconhecido",
            hair_style: character?.hair_style,
            hair_color: character?.hair_color,
            eye_color: character?.eye_color,
            skin_tone: character?.skin_tone,
            face_style: character?.face_style,
            accessory: character?.accessory,
            level: character?.level,
          };

          // Deduplicate by id
          setMessages((prev) => {
            if (prev.some((m) => m.id === messageWithName.id)) return prev;
            return [...prev, messageWithName];
          });

          // Play notification if not from us and chat not open
          if (newMessage.sender_id !== user.id && !isOpen) {
            playNotificationSound();
            toast.info(`💬 Mensagem de ${character?.name || "Alguém"}`, {
              description: newMessage.message.slice(0, 50) + (newMessage.message.length > 50 ? "..." : ""),
            });
          }

          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, user, isOpen, queryClient]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user || !partnerId) throw new Error("Não autenticado ou sem destinatário");

      // Validate message length
      const trimmedMessage = message.trim().slice(0, MESSAGE_MAX_LENGTH);
      if (!trimmedMessage) throw new Error("Mensagem vazia");

      const { error } = await supabase.from("private_messages").insert({
        sender_id: user.id,
        receiver_id: partnerId,
        message: trimmedMessage,
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

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadTotal, setUnreadTotal] = useState(0);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!user) return [];

      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from("private_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();

      for (const msg of messages || []) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        if (!conversationMap.has(partnerId)) {
          // Get partner info
          const { data: character } = await supabase
            .from("characters")
            .select("name, hair_style, hair_color, eye_color, skin_tone, face_style, accessory, level")
            .eq("user_id", partnerId)
            .single();

          conversationMap.set(partnerId, {
            partner_id: partnerId,
            partner_name: character?.name || "Desconhecido",
            last_message: msg.message.slice(0, 50) + (msg.message.length > 50 ? "..." : ""),
            last_message_time: msg.created_at,
            unread_count: 0,
            hair_style: character?.hair_style,
            hair_color: character?.hair_color,
            eye_color: character?.eye_color,
            skin_tone: character?.skin_tone,
            face_style: character?.face_style,
            accessory: character?.accessory,
            level: character?.level,
          });
        }

        // Count unread messages
        const conv = conversationMap.get(partnerId)!;
        if (msg.receiver_id === user.id && !msg.is_read) {
          conv.unread_count++;
        }
      }

      const result = Array.from(conversationMap.values());
      
      // Calculate total unread
      const total = result.reduce((sum, c) => sum + c.unread_count, 0);
      setUnreadTotal(total);

      return result;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("private-messages-all")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          const newMessage = payload.new as PrivateMessage;
          
          // Refresh if message involves us
          if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    conversations: conversations || [],
    isLoading,
    unreadTotal,
  };
}

// Hook to start a conversation with a player
export function useStartConversation() {
  const { user } = useAuth();

  const startConversation = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      if (!user) {
        toast.error("Você precisa estar logado");
        return false;
      }

      if (targetUserId === user.id) {
        toast.error("Você não pode enviar mensagem para si mesmo");
        return false;
      }

      return true;
    },
    [user]
  );

  return { startConversation };
}
