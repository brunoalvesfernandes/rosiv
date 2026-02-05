import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SpeechBubbleProps {
  message: string | null;
  timestamp: number | null;
  playerName: string;
}

const BUBBLE_DURATION = 8000; // 8 seconds

export function SpeechBubble({ message, timestamp, playerName }: SpeechBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message && timestamp) {
      const age = Date.now() - timestamp;
      if (age < BUBBLE_DURATION) {
        setDisplayMessage(message);
        setVisible(true);
        
        const timeout = setTimeout(() => {
          setVisible(false);
        }, BUBBLE_DURATION - age);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [message, timestamp]);

  return (
    <AnimatePresence>
      {visible && displayMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20"
        >
          <div className="relative">
            {/* Bubble */}
            <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 max-w-[180px] shadow-lg shadow-primary/10">
              <p className="text-xs text-foreground break-words leading-relaxed">
                {displayMessage.length > 80 ? displayMessage.slice(0, 80) + "..." : displayMessage}
              </p>
            </div>
            {/* Tail */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-card/95" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
