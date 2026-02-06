import { motion, AnimatePresence } from "framer-motion";

interface PlayerStatusBubbleProps {
  status: "idle" | "typing" | "sleeping" | "message";
  message?: string | null;
}

export function PlayerStatusBubble({ status, message }: PlayerStatusBubbleProps) {
  if (status === "idle" && !message) return null;

  return (
    <AnimatePresence mode="wait">
      {/* Typing indicator - 3 dots */}
      {status === "typing" && (
        <motion.div
          key="typing"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.8 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30"
        >
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl px-3 py-2 shadow-lg flex gap-1 items-center">
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
          </div>
          {/* Tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-card/95" />
          </div>
        </motion.div>
      )}

      {/* Sleeping indicator - ZZZ */}
      {status === "sleeping" && (
        <motion.div
          key="sleeping"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-full right-0 -translate-y-2 pointer-events-none z-30"
        >
          <div className="flex flex-col items-end gap-0">
            <motion.span
              animate={{ 
                y: [0, -3, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="text-primary font-bold text-[10px]"
            >
              z
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -3, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="text-primary font-bold text-xs -mt-1"
            >
              Z
            </motion.span>
            <motion.span
              animate={{ 
                y: [0, -4, 0],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="text-primary font-bold text-sm -mt-1"
            >
              Z
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Speech bubble with message */}
      {status === "message" && message && (
        <motion.div
          key="message"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-30"
        >
          <div className="relative">
            {/* Bubble */}
            <div className="bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 max-w-[180px] shadow-lg shadow-primary/10">
              <p className="text-xs text-foreground break-words leading-relaxed">
                {message.length > 80 ? message.slice(0, 80) + "..." : message}
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

// Closed eyes SVG for sleeping state
export function SleepingEyes() {
  return (
    <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Closed eyes - horizontal lines */}
      <line x1="23" y1="19" x2="31" y2="19" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="19" x2="41" y2="19" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      {/* Small curves below for eyelids */}
      <path d="M23,19 Q27,22 31,19" stroke="#333" strokeWidth="1" fill="none" />
      <path d="M33,19 Q37,22 41,19" stroke="#333" strokeWidth="1" fill="none" />
    </svg>
  );
}
