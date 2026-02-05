import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLobbyPresence } from "@/hooks/useLobbyPresence";
import { useGlobalChat } from "@/hooks/useChat";
import { useCharacter } from "@/hooks/useCharacter";
import { WaterBackground } from "./WaterBackground";
import { LobbyAvatar } from "./LobbyAvatar";
import { FullscreenLobby } from "./FullscreenLobby";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, MessageCircle, Maximize2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const LOBBY_WIDTH = 700;
const LOBBY_HEIGHT = 400;
const AVATAR_PADDING = 40;

export function WaterLobby() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: character } = useCharacter();
  const { players, myPosition, updatePosition, broadcastMessage, myUserId } = useLobbyPresence();
  const { messages, sendMessage, cooldownRemaining } = useGlobalChat(true, character?.name);
  
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(!isMobile);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    
    // Scale to base dimensions
    const scaleX = LOBBY_WIDTH / rect.width;
    const scaleY = LOBBY_HEIGHT / rect.height;
    x = x * scaleX;
    y = y * scaleY;
    
    // Clamp position within bounds
    x = Math.max(AVATAR_PADDING, Math.min(LOBBY_WIDTH - AVATAR_PADDING, x));
    y = Math.max(AVATAR_PADDING, Math.min(LOBBY_HEIGHT - AVATAR_PADDING, y));
    
    updatePosition(x, y);
  }, [updatePosition]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg) return;
    
    sendMessage.mutate(msg);
    broadcastMessage(msg);
    setChatInput("");
  }, [chatInput, sendMessage, broadcastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigate = (route: string) => {
    // Map route names to actual paths
    const routeMap: Record<string, string> = {
      crafting: "/crafting",
      shop: "/shop",
      dungeons: "/dungeons",
      arena: "/arena",
      mining: "/mining",
      inventory: "/inventory",
      guild: "/guild",
    };
    
    const path = routeMap[route] || `/${route}`;
    navigate(path);
  };

  const onlineCount = players.length;

  // Get scaled position for display
  const getDisplayPosition = (x: number, y: number, containerRect: DOMRect) => {
    const scaleX = containerRect.width / LOBBY_WIDTH;
    const scaleY = containerRect.height / LOBBY_HEIGHT;
    return {
      x: x * scaleX,
      y: y * scaleY,
    };
  };

  const containerRect = containerRef.current?.getBoundingClientRect();

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              {onlineCount} {onlineCount === 1 ? "jogador" : "jogadores"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Expandir</span>
              <span className="sm:hidden">Jogar</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
              className="gap-1 sm:gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{showChat ? "Esconder" : "Chat"}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          {/* Lobby Area - Responsive */}
          <div 
            ref={containerRef}
            className="relative rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)] cursor-crosshair w-full lg:flex-shrink-0 aspect-[7/4] lg:w-[700px] lg:h-[400px]"
            onClick={handleClick}
          >
            {/* Animated Water Background */}
            <WaterBackground 
              width={containerRect?.width || LOBBY_WIDTH} 
              height={containerRect?.height || LOBBY_HEIGHT} 
            />
            
            {/* "Clique para mover" hint */}
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-[10px] sm:text-xs text-muted-foreground/60 pointer-events-none">
              Toque para mover
            </div>

            {/* Expand hint on mobile */}
            {isMobile && (
              <div className="absolute top-2 right-2 text-[10px] text-primary/80 bg-background/50 backdrop-blur-sm rounded px-2 py-1 pointer-events-none">
                Toque "Jogar" para tela cheia
              </div>
            )}

            {/* Players - scaled positions */}
            {players.map((player) => {
              const displayPos = containerRect 
                ? getDisplayPosition(player.odw_x, player.odw_y, containerRect)
                : { x: player.odw_x, y: player.odw_y };
              
              return (
                <LobbyAvatar
                  key={player.odw_uid}
                  player={{ ...player, odw_x: displayPos.x, odw_y: displayPos.y }}
                  isMe={player.odw_uid === myUserId}
                  compact={isMobile}
                />
              );
            })}
          </div>

          {/* Chat Panel - Responsive */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-1 min-w-0 lg:min-w-[280px] lg:max-w-[320px] bg-card/50 backdrop-blur-sm border border-border rounded-xl flex flex-col overflow-hidden"
                style={{ maxHeight: isMobile ? 200 : LOBBY_HEIGHT }}
              >
                {/* Chat Header */}
                <div className="px-3 py-2 border-b border-border/50 flex-shrink-0">
                  <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    Chat Global
                  </h3>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-3 py-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    {messages.slice(-30).map((msg) => (
                      <div key={msg.id} className="text-[10px] sm:text-xs">
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
                <div className="p-2 border-t border-border/50 flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={cooldownRemaining > 0 ? `${cooldownRemaining}s...` : "Digite..."}
                      disabled={cooldownRemaining > 0}
                      className="text-xs h-7 sm:h-8"
                      maxLength={200}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || cooldownRemaining > 0 || sendMessage.isPending}
                      className="h-7 sm:h-8 px-2"
                    >
                      <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Lobby */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenLobby 
            onClose={() => setIsFullscreen(false)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
