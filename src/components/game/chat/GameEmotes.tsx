import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

// Game-themed emotes with codes and display
export const GAME_EMOTES: Record<string, string> = {
  ":sword:": "⚔️",
  ":shield:": "🛡️",
  ":gold:": "💰",
  ":gem:": "💎",
  ":fire:": "🔥",
  ":ice:": "❄️",
  ":lightning:": "⚡",
  ":heart:": "❤️",
  ":star:": "⭐",
  ":crown:": "👑",
  ":skull:": "💀",
  ":dragon:": "🐉",
  ":potion:": "🧪",
  ":bow:": "🏹",
  ":magic:": "✨",
  ":muscle:": "💪",
  ":trophy:": "🏆",
  ":target:": "🎯",
  ":rage:": "😤",
  ":laugh:": "😂",
  ":cool:": "😎",
  ":think:": "🤔",
  ":sad:": "😢",
  ":love:": "😍",
  ":gg:": "🎮",
  ":wave:": "👋",
  ":thumbsup:": "👍",
  ":clap:": "👏",
  ":pray:": "🙏",
  ":party:": "🎉",
};

// Parse message and replace emote codes with emojis
export function parseEmotes(message: string): string {
  let parsedMessage = message;
  Object.entries(GAME_EMOTES).forEach(([code, emoji]) => {
    parsedMessage = parsedMessage.split(code).join(emoji);
  });
  return parsedMessage;
}

interface EmotePickerProps {
  onEmoteSelect: (emote: string) => void;
}

export function EmotePicker({ onEmoteSelect }: EmotePickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmoteClick = (code: string) => {
    onEmoteSelect(code);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          title="Emotes"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(GAME_EMOTES).map(([code, emoji]) => (
            <button
              key={code}
              onClick={() => handleEmoteClick(code)}
              className="p-2 hover:bg-secondary rounded text-lg transition-colors"
              title={code}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          Use códigos como <code>:sword:</code> para emotes
        </div>
      </PopoverContent>
    </Popover>
  );
}
