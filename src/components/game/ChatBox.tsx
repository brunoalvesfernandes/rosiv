import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageCircle, Users, Globe, Loader2, Clock } from "lucide-react";
import { useGlobalChat, useGuildChat, ChatMessage } from "@/hooks/useChat";
import { useMyGuild } from "@/hooks/useGuilds";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AvatarFace } from "./AvatarFace";

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
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>Nenhuma mensagem ainda</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-48 overflow-y-auto space-y-2 pr-2">
      {messages.map((msg) => {
        const isMe = msg.user_id === currentUserId;
        const hasAvatar = msg.hair_style && msg.skin_tone;
        
        return (
          <div
            key={msg.id}
            className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
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
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                {msg.sender_name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Message content */}
            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[180px] rounded-lg px-3 py-2 ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
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
  cooldown?: number; // Seconds remaining
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

  const isDisabled = isPending || cooldown > 0;

  return (
    <div className="flex gap-2 mt-3">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={cooldown > 0 ? `Aguarde ${cooldown}s...` : placeholder || "Digite sua mensagem..."}
        maxLength={200}
        disabled={isDisabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || isDisabled}
        title={cooldown > 0 ? `Aguarde ${cooldown}s` : undefined}
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

export function ChatBox() {
  const { user } = useAuth();
  const { data: myGuildData } = useMyGuild();
  const myGuild = myGuildData?.guilds as { id: string } | undefined;

  const {
    messages: globalMessages,
    isLoading: globalLoading,
    sendMessage: sendGlobalMessage,
    cooldownRemaining,
  } = useGlobalChat();

  const {
    messages: guildMessages,
    isLoading: guildLoading,
    sendMessage: sendGuildMessage,
  } = useGuildChat(myGuild?.id);

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global">
          <TabsList className="w-full">
            <TabsTrigger value="global" className="flex-1 gap-1">
              <Globe className="w-4 h-4" />
              Global
            </TabsTrigger>
            <TabsTrigger
              value="guild"
              className="flex-1 gap-1"
              disabled={!myGuild}
            >
              <Users className="w-4 h-4" />
              Guilda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-3">
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

          <TabsContent value="guild" className="mt-3">
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
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>Entre em uma guilda para usar o chat</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
