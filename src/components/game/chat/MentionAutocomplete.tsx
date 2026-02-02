import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlinePlayers, OnlinePlayer } from "@/hooks/usePlayerPresence";
import { cn } from "@/lib/utils";
import { AvatarFace } from "../AvatarFace";
import { Circle } from "lucide-react";

interface MentionAutocompleteProps {
  inputValue: string;
  cursorPosition: number;
  onSelect: (playerName: string, startIndex: number, endIndex: number) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

export function MentionAutocomplete({
  inputValue,
  cursorPosition,
  onSelect,
  inputRef,
  isVisible,
  onVisibilityChange,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: onlinePlayers = [] } = useOnlinePlayers(searchTerm);

  // Detect @ mention
  useEffect(() => {
    const textBeforeCursor = inputValue.slice(0, cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex !== -1) {
      // Check if @ is at start or preceded by space
      const charBefore = textBeforeCursor[atIndex - 1];
      if (atIndex === 0 || charBefore === " ") {
        const searchText = textBeforeCursor.slice(atIndex + 1);
        // Only show if no space after @ (still typing the name)
        if (!searchText.includes(" ")) {
          setSearchTerm(searchText);
          setMentionStart(atIndex);
          onVisibilityChange(true);
          setSelectedIndex(0);
          return;
        }
      }
    }

    onVisibilityChange(false);
    setSearchTerm("");
    setMentionStart(-1);
  }, [inputValue, cursorPosition, onVisibilityChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible || onlinePlayers.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % onlinePlayers.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + onlinePlayers.length) % onlinePlayers.length);
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          const player = onlinePlayers[selectedIndex];
          if (player) {
            onSelect(player.character_name, mentionStart, cursorPosition);
          }
          break;
        case "Escape":
          e.preventDefault();
          onVisibilityChange(false);
          break;
      }
    },
    [isVisible, onlinePlayers, selectedIndex, mentionStart, cursorPosition, onSelect, onVisibilityChange]
  );

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.addEventListener("keydown", handleKeyDown);
      return () => input.removeEventListener("keydown", handleKeyDown);
    }
  }, [inputRef, handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isVisible) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isVisible]);

  if (!isVisible || onlinePlayers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
      >
        <div className="px-2 py-1.5 border-b border-border bg-muted/50">
          <span className="text-[10px] text-muted-foreground font-medium">
            Jogadores online ({onlinePlayers.length})
          </span>
        </div>
        <div ref={listRef} className="max-h-40 overflow-y-auto">
          {onlinePlayers.map((player, index) => (
            <button
              key={player.user_id}
              type="button"
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted/50"
              )}
              onClick={() => onSelect(player.character_name, mentionStart, cursorPosition)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <span className="text-[10px] font-bold">
                    {player.character_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
              </div>
              <span className="text-sm font-medium truncate flex-1">
                {player.character_name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                @{player.character_name}
              </span>
            </button>
          ))}
        </div>
        <div className="px-2 py-1 border-t border-border bg-muted/30">
          <span className="text-[9px] text-muted-foreground">
            ↑↓ navegar • Enter selecionar • Esc fechar
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
