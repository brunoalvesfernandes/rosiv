import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useLobbyPresence } from "@/hooks/useLobbyPresence";
import { useGlobalChat } from "@/hooks/useChat";
import { useCharacter } from "@/hooks/useCharacter";
import { WaterBackground } from "./WaterBackground";
import { LobbyAvatar } from "./LobbyAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LOBBY_WIDTH = 700;
const LOBBY_HEIGHT = 400;
const AVATAR_PADDING = 40;

export function WaterLobby() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: character } = useCharacter();
  const { players, myPosition, updatePosition, broadcastMessage, myUserId } = useLobbyPresence();
  const { messages, sendMessage, cooldownRemaining } = useGlobalChat(true, character?.name);
  
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle click to move
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Clamp position within bounds
    x = Math.max(AVATAR_PADDING, Math.min(LOBBY_WIDTH - AVATAR_PADDING, x));
    y = Math.max(AVATAR_PADDING, Math.min(LOBBY_HEIGHT - AVATAR_PADDING, y));
    
    updatePosition(x, y);
  }, [updatePosition]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    
    // Send to global chat
    sendMessage.mutate(msg);
    
    // Broadcast as speech bubble
    broadcastMessage(msg);
    
    setChatInput("");
  }, [chatInput, sendMessage, broadcastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onlineCount = players.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground">
            <Users className="w-4 h-4 inline mr-1" />
            {onlineCount} {onlineCount === 1 ? "jogador" : "jogadores"} no lobby
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowChat(!showChat)}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          {showChat ? "Esconder Chat" : "Mostrar Chat"}
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Lobby Area */}
        <div 
          ref={containerRef}
          className="relative rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)] cursor-crosshair flex-shrink-0"
          style={{ width: LOBBY_WIDTH, height: LOBBY_HEIGHT }}
          onClick={handleClick}
        >
          {/* Animated Water Background */}
          <WaterBackground width={LOBBY_WIDTH} height={LOBBY_HEIGHT} />
          
          {/* "Clique para mover" hint */}
          <div className="absolute bottom-3 left-3 text-xs text-muted-foreground/60 pointer-events-none">
            Clique para mover
          </div>

          {/* Players */}
          {players.map((player) => (
            <LobbyAvatar
              key={player.odw_uid}
              player={player}
              isMe={player.odw_uid === myUserId}
            />
          ))}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-[280px] max-w-[320px] bg-card/50 backdrop-blur-sm border border-border rounded-xl flex flex-col"
            style={{ height: LOBBY_HEIGHT }}
          >
            {/* Chat Header */}
            <div className="px-3 py-2 border-b border-border/50">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Chat Global
              </h3>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 py-2">
              <div className="space-y-2">
                {messages.slice(-30).map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <span className={cn(
                      "font-medium",
                      msg.user_id === myUserId ? "text-primary" : "text-foreground"
                    )}>
                      {msg.sender_name}:
                    </span>
                    <span className="text-muted-foreground ml-1 break-words">
                      {msg.message}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-2 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={cooldownRemaining > 0 ? `Aguarde ${cooldownRemaining}s...` : "Digite..."}
                  disabled={cooldownRemaining > 0}
                  className="text-xs h-8"
                  maxLength={200}
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || cooldownRemaining > 0 || sendMessage.isPending}
                  className="h-8 px-2"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
