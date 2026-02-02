import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, Users, Globe, Loader2, X, Minimize2, Clock, Maximize2, Mail } from "lucide-react";
import { useGlobalChat, useGuildChat, ChatMessage } from "@/hooks/useChat";
import { useMyGuild } from "@/hooks/useGuilds";
import { useAuth } from "@/contexts/AuthContext";
import { useCharacter } from "@/hooks/useCharacter";
import { useConversations } from "@/hooks/usePrivateMessages";
import { usePlayerPresence } from "@/hooks/usePlayerPresence";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AvatarFace } from "./AvatarFace";
import { EmotePicker, parseEmotes } from "./chat/GameEmotes";
import { LevelBadge } from "./chat/LevelBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MentionAutocomplete } from "./chat/MentionAutocomplete";
import { PrivateMessagePanel } from "./chat/PrivateMessagePanel";
import { censorProfanity } from "@/utils/profanityFilter";

const MESSAGE_MAX_LENGTH = 500;

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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <MessageCircle className="w-10 h-10 opacity-30" />
        <p className="text-sm">Nenhuma mensagem ainda</p>
        <p className="text-xs">Seja o primeiro a enviar!</p>
      </div>
    );
  }

  const getRoleStyles = (role?: 'leader' | 'officer' | 'member' | null) => {
    switch (role) {
      case 'leader': return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '👑' };
      case 'officer': return { color: 'text-sky-400', bg: 'bg-sky-500/20', icon: '⚔️' };
      case 'member': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '' };
      default: return { color: 'text-muted-foreground', bg: '', icon: '' };
    }
  };

  return (
    <ScrollArea className="flex-1 h-full">
      <div ref={scrollRef} className="space-y-3 p-3">
        {messages.map((msg, index) => {
          const isMe = msg.user_id === currentUserId;
          const hasAvatar = msg.hair_style && msg.skin_tone;
          const roleStyles = getRoleStyles(msg.guild_role);
          const showDate = index === 0 || 
            new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
          
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground px-2">
                    {new Date(msg.created_at).toLocaleDateString('pt-BR', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {hasAvatar ? (
                    <div className={cn(
                      "rounded-full p-0.5",
                      msg.guild_role && roleStyles.bg
                    )}>
                      <AvatarFace
                        hairStyle={msg.hair_style!}
                        hairColor={msg.hair_color!}
                        eyeColor={msg.eye_color!}
                        skinTone={msg.skin_tone!}
                        faceStyle={msg.face_style!}
                        accessory={msg.accessory}
                        size="xs"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {msg.sender_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className={cn("flex flex-col min-w-0 max-w-[75%]", isMe ? "items-end" : "items-start")}>
                  {/* Name and level */}
                  <div className={cn(
                    "flex items-center gap-1 mb-0.5 px-1",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}>
                    {roleStyles.icon && (
                      <span className="text-xs">{roleStyles.icon}</span>
                    )}
                    <span className={cn("text-xs font-semibold truncate max-w-[120px]", roleStyles.color)}>
                      {msg.sender_name}
                    </span>
                    {msg.level && <LevelBadge level={msg.level} />}
                  </div>
                  
                  {/* Message bubble - FIXED OVERFLOW */}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 shadow-sm overflow-hidden",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap leading-relaxed overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {parseEmotes(censorProfanity(msg.message))}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
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
  const [showMention, setShowMention] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    // Truncate to max length before sending
    const trimmedMessage = message.trim().slice(0, MESSAGE_MAX_LENGTH);
    onSend(trimmedMessage);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showMention) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input length
    const value = e.target.value.slice(0, MESSAGE_MAX_LENGTH);
    setMessage(value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleMentionSelect = (playerName: string, startIndex: number, endIndex: number) => {
    const before = message.slice(0, startIndex);
    const after = message.slice(endIndex);
    const newValue = `${before}@${playerName} ${after}`.slice(0, MESSAGE_MAX_LENGTH);
    setMessage(newValue);
    setShowMention(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = Math.min(startIndex + playerName.length + 2, newValue.length);
        inputRef.current.setSelectionRange(newPosition, newPosition);
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleEmoteSelect = (emote: string) => {
    if (message.length + emote.length <= MESSAGE_MAX_LENGTH) {
      setMessage((prev) => prev + emote);
    }
    inputRef.current?.focus();
  };

  const isDisabled = isPending || cooldown > 0;

  return (
    <div className="flex gap-2 p-3 border-t border-border bg-muted/30 relative">
      <MentionAutocomplete
        inputValue={message}
        cursorPosition={cursorPosition}
        onSelect={handleMentionSelect}
        inputRef={inputRef}
        isVisible={showMention}
        onVisibilityChange={setShowMention}
      />
      <EmotePicker onEmoteSelect={handleEmoteSelect} />
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
          placeholder={cooldown > 0 ? `Aguarde ${cooldown}s...` : placeholder || "Digite sua mensagem..."}
          maxLength={MESSAGE_MAX_LENGTH}
          disabled={isDisabled}
          className="text-sm pr-14 bg-background/50"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          {message.length}/{MESSAGE_MAX_LENGTH}
        </span>
      </div>
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isDisabled}
        className="shrink-0"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : cooldown > 0 ? (
          <div className="relative">
            <Clock className="w-4 h-4" />
            <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-background rounded-full px-0.5">
              {cooldown}
            </span>
          </div>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("global");
  const { user } = useAuth();
  const location = useLocation();
  const { data: myGuildData } = useMyGuild();
  const { data: character } = useCharacter();
  const myGuild = myGuildData?.guilds as { id: string; name: string } | undefined;

  // Track player presence
  usePlayerPresence(character?.name);

  const {
    messages: globalMessages,
    isLoading: globalLoading,
    sendMessage: sendGlobalMessage,
    unreadCount: globalUnread,
    cooldownRemaining,
  } = useGlobalChat(isOpen && activeTab === "global", character?.name);

  const {
    messages: guildMessages,
    isLoading: guildLoading,
    sendMessage: sendGuildMessage,
    unreadCount: guildUnread,
  } = useGuildChat(myGuild?.id, isOpen && activeTab === "guild", character?.name);

  const { unreadTotal: privateUnread } = useConversations();

  // Hide chat on public pages
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (!user || isPublicPage) {
    return null;
  }

  const totalUnread = globalUnread + guildUnread + privateUnread;

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center text-primary-foreground"
      >
        <MessageCircle className="w-6 h-6" />
        <AnimatePresence>
          {totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  const chatWidth = isExpanded ? "w-[28rem]" : "w-80 sm:w-96";
  const chatHeight = isMinimized ? "h-12" : isExpanded ? "h-[500px]" : "h-[420px]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={cn(
        "fixed bottom-20 right-4 z-50 bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
        chatWidth,
        chatHeight
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-muted/80 to-muted/40 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Chat</span>
            {character?.name && (
              <p className="text-[10px] text-muted-foreground">
                Conectado como {character.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Reduzir" : "Expandir"}
          >
            <Maximize2 className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-destructive/20 hover:text-destructive"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-10 shrink-0">
                <TabsTrigger
                  value="global"
                  className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1.5 text-xs relative h-full"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Global
                  <AnimatePresence>
                    {globalUnread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="ml-1 min-w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1"
                      >
                        {globalUnread > 99 ? "99+" : globalUnread}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
                <TabsTrigger
                  value="guild"
                  className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1.5 text-xs relative h-full"
                  disabled={!myGuild}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[60px]">{myGuild?.name || "Guilda"}</span>
                  <AnimatePresence>
                    {guildUnread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="ml-1 min-w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1"
                      >
                        {guildUnread > 99 ? "99+" : guildUnread}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
                <TabsTrigger
                  value="private"
                  className="flex-1 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary gap-1.5 text-xs relative h-full"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Privado
                  <AnimatePresence>
                    {privateUnread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="ml-1 min-w-4 h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1"
                      >
                        {privateUnread > 99 ? "99+" : privateUnread}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden">
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

              <TabsContent value="guild" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden">
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
                      placeholder={`Mensagem para ${myGuild.name}...`}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4">
                    <Users className="w-12 h-12 opacity-30" />
                    <p className="text-sm font-medium">Sem guilda</p>
                    <p className="text-xs text-center">Entre em uma guilda para conversar com seus companheiros</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="private" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <PrivateMessagePanel onClose={() => setActiveTab("global")} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
