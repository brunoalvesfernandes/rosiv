import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, Users, Globe, Loader2, X, Minimize2, Clock } from "lucide-react";
import { useGlobalChat, useGuildChat, ChatMessage } from "@/hooks/useChat";
import { useMyGuild } from "@/hooks/useGuilds";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/hooks/useCharacter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AvatarFace } from "./AvatarFace";
import { EmotePicker, parseEmotes } from "./chat/GameEmotes";
import { LevelBadge } from "./chat/LevelBadge";

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

  const getRoleColor = (role?: 'leader' | 'officer' | 'member' | null) => {
    switch (role) {
      case 'leader': return 'text-yellow-400';
      case 'officer': return 'text-blue-400';
      case 'member': return 'text-green-400';
      default: return 'opacity-70';
    }
  };

  const getRoleLabel = (role?: 'leader' | 'officer' | 'member' | null) => {
    switch (role) {
      case 'leader': return '👑';
      case 'officer': return '⚔️';
      default: return '';
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-3">
      {messages.map((msg) => {
        const isMe = msg.user_id === currentUserId;
        const hasAvatar = msg.hair_style && msg.skin_tone;
        const roleLabel = getRoleLabel(msg.guild_role);
        const roleColor = getRoleColor(msg.guild_role);
        
        return (
          <div
            key={msg.id}
            className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
          >
            {/* Avatar */}
            {hasAvatar ? (
              <AvatarFace
                hairStyle={msg.hair_style!}
                hairColor={msg.hair_color!}
                eyeColor={msg.eye_color!}
                skinTone={msg.skin_tone!}
                faceStyle={msg.face_style!}
                accessory={msg.accessory}
                size="xs"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">
                {msg.sender_name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2",
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className={`text-xs font-medium flex items-center gap-1 ${roleColor}`}>
                  {roleLabel} {msg.sender_name}
                  {msg.level && <LevelBadge level={msg.level} />}
                </p>
                <p className="text-sm break-words">{parseEmotes(msg.message)}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(msg.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
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
  cooldown?: number;
}

function ChatInput({ onSend, isPending, placeholder, cooldown = 0 }: ChatInputProps) {
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

  const handleEmoteSelect = (emote: string) => {
    setMessage((prev) => prev + emote);
  };

  const isDisabled = isPending || cooldown > 0;

  return (
    <div className="flex gap-2 p-3 border-t border-border">
      <EmotePicker onEmoteSelect={handleEmoteSelect} />
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={cooldown > 0 ? `Aguarde ${cooldown}s...` : placeholder || "Digite sua mensagem..."}
        maxLength={200}
        disabled={isDisabled}
        className="text-sm"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isDisabled}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : cooldown > 0 ? (
          <Clock className="w-4 h-4" />
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
  const { data: character } = useCharacter();
  const myGuild = myGuildData?.guilds as { id: string } | undefined;

  const {
    messages: globalMessages,
    isLoading: globalLoading,
    sendMessage: sendGlobalMessage,
    unreadCount: globalUnread,
    cooldownRemaining,
  } = useGlobalChat(isOpen, character?.name);

  const {
    messages: guildMessages,
    isLoading: guildLoading,
    sendMessage: sendGuildMessage,
    unreadCount: guildUnread,
  } = useGuildChat(myGuild?.id, isOpen, character?.name);

  // Hide chat on public pages
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // Don't show chat if not logged in or on public pages
  if (!user || isPublicPage) {
    return null;
  }

  const totalUnread = globalUnread + guildUnread;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
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
              className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1 text-xs relative"
            >
              <Globe className="w-3 h-3" />
              Global
              {globalUnread > 0 && (
                <span className="ml-1 min-w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                  {globalUnread > 99 ? "99+" : globalUnread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="guild"
              className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1 text-xs relative"
              disabled={!myGuild}
            >
              <Users className="w-3 h-3" />
              Guilda
              {guildUnread > 0 && (
                <span className="ml-1 min-w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                  {guildUnread > 99 ? "99+" : guildUnread}
                </span>
              )}
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
              cooldown={cooldownRemaining}
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
