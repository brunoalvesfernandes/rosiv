import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Circle,
  Search,
  MessageSquare 
} from "lucide-react";
import { usePrivateMessages, useConversations, Conversation, PrivateMessage } from "@/hooks/usePrivateMessages";
import { useOnlinePlayers } from "@/hooks/usePlayerPresence";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AvatarFace } from "../AvatarFace";
import { parseEmotes } from "./GameEmotes";
import { LevelBadge } from "./LevelBadge";
import { EmotePicker } from "./GameEmotes";
import { MentionAutocomplete } from "./MentionAutocomplete";
import { censorProfanity } from "@/utils/profanityFilter";

interface PrivateMessagePanelProps {
  onClose: () => void;
}

export function PrivateMessagePanel({ onClose }: PrivateMessagePanelProps) {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {selectedPartner ? (
        <ConversationView
          partnerId={selectedPartner}
          onBack={() => setSelectedPartner(null)}
        />
      ) : showNewMessage ? (
        <NewMessageView
          onBack={() => setShowNewMessage(false)}
          onSelectPlayer={(id) => {
            setSelectedPartner(id);
            setShowNewMessage(false);
          }}
        />
      ) : (
        <ConversationList
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={setSelectedPartner}
          onNewMessage={() => setShowNewMessage(true)}
        />
      )}
    </div>
  );
}

interface ConversationListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (partnerId: string) => void;
  onNewMessage: () => void;
}

function ConversationList({ 
  searchQuery, 
  onSearchChange, 
  onSelectConversation,
  onNewMessage 
}: ConversationListProps) {
  const { conversations, isLoading } = useConversations();

  const filteredConversations = conversations.filter((c) =>
    c.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Mensagens Privadas</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onNewMessage}>
            Nova
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar conversa..."
            className="h-8 text-xs pl-7"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-xs">Nenhuma conversa</p>
            <Button variant="link" className="text-xs h-auto p-0" onClick={onNewMessage}>
              Iniciar nova conversa
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => (
              <button
                key={conv.partner_id}
                onClick={() => onSelectConversation(conv.partner_id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                {/* Avatar */}
                {conv.hair_style && conv.skin_tone ? (
                  <AvatarFace
                    hairStyle={conv.hair_style}
                    hairColor={conv.hair_color || "#4a3728"}
                    eyeColor={conv.eye_color || "#3b82f6"}
                    skinTone={conv.skin_tone}
                    faceStyle={conv.face_style || "round"}
                    accessory={conv.accessory}
                    size="xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {conv.partner_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{conv.partner_name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message_time), {
                        addSuffix: false,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unread_count > 0 && (
                  <span className="shrink-0 min-w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                    {conv.unread_count > 99 ? "99+" : conv.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

interface NewMessageViewProps {
  onBack: () => void;
  onSelectPlayer: (playerId: string) => void;
}

function NewMessageView({ onBack, onSelectPlayer }: NewMessageViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: onlinePlayers = [], isLoading } = useOnlinePlayers(searchQuery);
  const { user } = useAuth();

  const filteredPlayers = onlinePlayers.filter((p) => p.user_id !== user?.id);

  return (
    <>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-sm">Nova Mensagem</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar jogador online..."
            className="h-8 text-xs pl-7"
            autoFocus
          />
        </div>
      </div>

      {/* Player list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <Circle className="w-8 h-8 opacity-30" />
            <p className="text-xs">Nenhum jogador online encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPlayers.map((player) => (
              <button
                key={player.user_id}
                onClick={() => onSelectPlayer(player.user_id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {player.character_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-emerald-500 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{player.character_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );
}

interface ConversationViewProps {
  partnerId: string;
  onBack: () => void;
}

function ConversationView({ partnerId, onBack }: ConversationViewProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = usePrivateMessages(partnerId, true);
  const [messageInput, setMessageInput] = useState("");
  const [showMention, setShowMention] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get partner info from first message
  const partnerInfo = messages.find((m) => m.sender_id === partnerId);
  const partnerName = partnerInfo?.sender_name || "Carregando...";

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage.mutate(messageInput.trim());
    setMessageInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !showMention) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleMentionSelect = (playerName: string, startIndex: number, endIndex: number) => {
    const before = messageInput.slice(0, startIndex);
    const after = messageInput.slice(endIndex);
    const newValue = `${before}@${playerName} ${after}`;
    setMessageInput(newValue);
    setShowMention(false);
    
    // Set cursor after the mention
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = startIndex + playerName.length + 2;
        inputRef.current.setSelectionRange(newPosition, newPosition);
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleEmoteSelect = (emote: string) => {
    setMessageInput((prev) => prev + emote);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {partnerInfo?.hair_style && partnerInfo?.skin_tone ? (
          <AvatarFace
            hairStyle={partnerInfo.hair_style}
            hairColor={partnerInfo.hair_color || "#4a3728"}
            eyeColor={partnerInfo.eye_color || "#3b82f6"}
            skinTone={partnerInfo.skin_tone}
            faceStyle={partnerInfo.face_style || "round"}
            accessory={partnerInfo.accessory}
            size="xs"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[10px] font-bold">
              {partnerName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <span className="font-semibold text-sm">{partnerName}</span>
          {partnerInfo?.level && (
            <LevelBadge level={partnerInfo.level} />
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <p className="text-xs">Início da conversa</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap leading-relaxed overflow-hidden" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {parseEmotes(censorProfanity(msg.message))}
                    </p>
                    <span className={cn(
                      "text-[9px] mt-1 block",
                      isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border relative">
        <MentionAutocomplete
          inputValue={messageInput}
          cursorPosition={cursorPosition}
          onSelect={handleMentionSelect}
          inputRef={inputRef}
          isVisible={showMention}
          onVisibilityChange={setShowMention}
        />
        <div className="flex gap-2">
          <EmotePicker onEmoteSelect={handleEmoteSelect} />
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
              placeholder="Digite sua mensagem..."
              maxLength={500}
              className="text-sm pr-12 bg-background/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              {messageInput.length}/500
            </span>
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!messageInput.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
