import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLobbyPresence } from "@/hooks/useLobbyPresence";
import { useGlobalChat } from "@/hooks/useChat";
import { useCharacter } from "@/hooks/useCharacter";
import { WaterBackground } from "./WaterBackground";
import { LobbyAvatar } from "./LobbyAvatar";
import { LobbyGameNav } from "./LobbyGameNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Users, 
  MessageCircle, 
  X, 
  Minimize2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FullscreenLobbyProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const AVATAR_PADDING = 50;

export function FullscreenLobby({ onClose, onNavigate }: FullscreenLobbyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { data: character } = useCharacter();
  const { players, updatePosition, broadcastMessage, myUserId } = useLobbyPresence();
  const { messages, sendMessage, cooldownRemaining } = useGlobalChat(true, character?.name);
  
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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
    
    // Convert to percentage for responsive positioning
    const percentX = (x / dimensions.width) * 100;
    const percentY = (y / dimensions.height) * 100;
    
    // Clamp
    const clampedX = Math.max(8, Math.min(92, percentX));
    const clampedY = Math.max(10, Math.min(90, percentY));
    
    // Convert back to absolute for storage (using base 700x400)
    const absX = (clampedX / 100) * 700;
    const absY = (clampedY / 100) * 400;
    
    updatePosition(absX, absY);
  }, [updatePosition, dimensions]);

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
    onClose();
    onNavigate(route);
  };

  const onlineCount = players.length;

  // Scale player positions to current dimensions
  const getScaledPosition = (x: number, y: number) => {
    const percentX = (x / 700) * 100;
    const percentY = (y / 400) * 100;
    return {
      x: (percentX / 100) * dimensions.width,
      y: (percentY / 100) * dimensions.height,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Main Lobby Area */}
      <div 
        ref={containerRef}
        className="relative w-full h-full cursor-crosshair overflow-hidden"
        onClick={handleClick}
      >
        {/* Animated Water Background */}
        <WaterBackground width={dimensions.width} height={dimensions.height} />
        
        {/* Navigation Points */}
        <LobbyGameNav 
          onNavigate={handleNavigate}
          lobbyWidth={dimensions.width}
          lobbyHeight={dimensions.height}
        />

        {/* Players */}
        {players.map((player) => {
          const scaled = getScaledPosition(player.odw_x, player.odw_y);
          return (
            <LobbyAvatar
              key={player.odw_uid}
              player={{ ...player, odw_x: scaled.x, odw_y: scaled.y }}
              isMe={player.odw_uid === myUserId}
            />
          );
        })}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between pointer-events-none z-30">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs sm:text-sm text-foreground">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              {onlineCount} online
            </span>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="pointer-events-auto gap-1"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 pointer-events-none">
          Toque para mover • Ícones para navegar
        </div>

        {/* Chat Toggle Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowChat(!showChat);
          }}
          className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full px-3 py-2 shadow-lg"
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Chat</span>
          {showChat ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </motion.button>

        {/* Chat Panel (Slide up from bottom on mobile) */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border rounded-t-2xl max-h-[50vh] flex flex-col"
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Chat Global
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-2 min-h-[120px] max-h-[200px]">
                <div className="space-y-2">
                  {messages.slice(-20).map((msg) => (
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
              <div className="p-3 border-t border-border/50 pb-safe">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={cooldownRemaining > 0 ? `Aguarde ${cooldownRemaining}s...` : "Digite..."}
                    disabled={cooldownRemaining > 0}
                    className="text-sm h-10"
                    maxLength={200}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || cooldownRemaining > 0 || sendMessage.isPending}
                    className="h-10 px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
