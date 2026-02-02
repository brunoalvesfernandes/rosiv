import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, Users, Globe, Loader2, X, Minimize2 } from "lucide-react";
import { useGlobalChat, useGuildChat, ChatMessage } from "@/hooks/useChat";
import { useMyGuild } from "@/hooks/useGuilds";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentUserId?: string;
}

function ChatMessages({ messages, isLoading, currentUserId }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Nenhuma mensagem ainda</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-3">
      {messages.map((msg) => {
        const isMe = msg.user_id === currentUserId;
        return (
          <div
            key={msg.id}
            className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2",
                isMe
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              <p className="text-xs font-medium opacity-70">{msg.sender_name}</p>
              <p className="text-sm break-words">{msg.message}</p>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(msg.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ChatInputProps {
  onSend: (message: string) => void;
  isPending: boolean;
  placeholder?: string;
}

function ChatInput({ onSend, isPending, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t border-border">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || "Digite sua mensagem..."}
        maxLength={200}
        disabled={isPending}
        className="text-sm"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isPending}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { data: myGuildData } = useMyGuild();
  const myGuild = myGuildData?.guilds as { id: string } | undefined;

  const {
    messages: globalMessages,
    isLoading: globalLoading,
    sendMessage: sendGlobalMessage,
  } = useGlobalChat();

  const {
    messages: guildMessages,
    isLoading: guildLoading,
    sendMessage: sendGuildMessage,
  } = useGuildChat(myGuild?.id);

  // Hide chat on public pages
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // Don't show chat if not logged in or on public pages
  if (!user || isPublicPage) {
    return null;
  }

  // Count unread (simple: just show indicator when there are messages)
  const hasMessages = globalMessages.length > 0 || guildMessages.length > 0;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
        {hasMessages && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-2xl transition-all duration-200",
        isMinimized ? "w-72 h-12" : "w-80 sm:w-96 h-[28rem]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm">Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <Tabs defaultValue="global" className="flex flex-col h-[calc(100%-3rem)]">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-10">
            <TabsTrigger
              value="global"
              className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1 text-xs"
            >
              <Globe className="w-3 h-3" />
              Global
            </TabsTrigger>
            <TabsTrigger
              value="guild"
              className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1 text-xs"
              disabled={!myGuild}
            >
              <Users className="w-3 h-3" />
              Guilda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="flex-1 flex flex-col m-0 overflow-hidden">
            <ChatMessages
              messages={globalMessages}
              isLoading={globalLoading}
              currentUserId={user?.id}
            />
            <ChatInput
              onSend={(msg) => sendGlobalMessage.mutate(msg)}
              isPending={sendGlobalMessage.isPending}
              placeholder="Mensagem global..."
            />
          </TabsContent>

          <TabsContent value="guild" className="flex-1 flex flex-col m-0 overflow-hidden">
            {myGuild ? (
              <>
                <ChatMessages
                  messages={guildMessages}
                  isLoading={guildLoading}
                  currentUserId={user?.id}
                />
                <ChatInput
                  onSend={(msg) => sendGuildMessage.mutate(msg)}
                  isPending={sendGuildMessage.isPending}
                  placeholder="Mensagem para guilda..."
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">Entre em uma guilda para usar o chat</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
