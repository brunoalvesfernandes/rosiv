import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialDrop } from "@/utils/materialDrops";
import { cn } from "@/lib/utils";

interface MaterialDropAnimationProps {
  drops: MaterialDrop[];
  onComplete?: () => void;
}

const rarityColors: Record<string, string> = {
  common: "from-zinc-400 to-zinc-600 border-zinc-500",
  uncommon: "from-green-400 to-green-600 border-green-500",
  rare: "from-blue-400 to-blue-600 border-blue-500",
  epic: "from-purple-400 to-purple-600 border-purple-500",
  legendary: "from-amber-400 to-amber-600 border-amber-500",
};

const rarityGlow: Record<string, string> = {
  common: "shadow-zinc-500/50",
  uncommon: "shadow-green-500/50",
  rare: "shadow-blue-500/50",
  epic: "shadow-purple-500/50",
  legendary: "shadow-amber-500/50",
};

export function MaterialDropAnimation({ drops, onComplete }: MaterialDropAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (drops.length === 0) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [drops, onComplete]);

  if (drops.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {/* Background overlay with radial gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30"
          />

          {/* Drops container */}
          <div className="flex flex-wrap gap-4 justify-center items-center max-w-md">
            {drops.map((drop, index) => (
              <motion.div
                key={`${drop.materialId}-${index}`}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  y: -100,
                  rotate: -180
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: 0,
                  rotate: 0
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0,
                  y: 50
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: index * 0.15,
                }}
                className="relative"
              >
                {/* Particle effects */}
                <ParticleEffect rarity={drop.rarity} delay={index * 0.15} />
                
                {/* Main drop card */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,255,255,0.3)",
                      "0 0 40px rgba(255,255,255,0.6)",
                      "0 0 20px rgba(255,255,255,0.3)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "relative flex flex-col items-center p-4 rounded-xl border-2",
                    "bg-gradient-to-br backdrop-blur-sm",
                    rarityColors[drop.rarity] || rarityColors.common,
                    "shadow-lg",
                    rarityGlow[drop.rarity] || rarityGlow.common
                  )}
                >
                  {/* Icon */}
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15 + 0.3,
                    }}
                    className="text-4xl mb-2"
                  >
                    {drop.icon || "📦"}
                  </motion.span>

                  {/* Quantity badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      delay: index * 0.15 + 0.4,
                    }}
                    className="absolute -top-2 -right-2 bg-white text-black font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg"
                  >
                    {drop.quantity}x
                  </motion.div>

                  {/* Material name */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                    className="text-white text-sm font-semibold text-center drop-shadow-lg max-w-24 truncate"
                  >
                    {drop.materialName}
                  </motion.span>

                  {/* Rarity label */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.6 }}
                    className="text-white/80 text-xs capitalize mt-1"
                  >
                    {drop.rarity}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-1/4 text-center"
          >
            <motion.h2
              animate={{
                textShadow: [
                  "0 0 10px rgba(255,215,0,0.5)",
                  "0 0 30px rgba(255,215,0,0.8)",
                  "0 0 10px rgba(255,215,0,0.5)",
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-3xl font-bold text-amber-400 drop-shadow-lg"
            >
              ✨ Materiais Obtidos! ✨
            </motion.h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Particle effect component
function ParticleEffect({ rarity, delay }: { rarity: string; delay: number }) {
  const particleColors: Record<string, string[]> = {
    common: ["#a1a1aa", "#71717a"],
    uncommon: ["#4ade80", "#22c55e"],
    rare: ["#60a5fa", "#3b82f6"],
    epic: ["#c084fc", "#a855f7"],
    legendary: ["#fbbf24", "#f59e0b"],
  };

  const colors = particleColors[rarity] || particleColors.common;

  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: Math.cos(i * 45 * Math.PI / 180) * 60,
            y: Math.sin(i * 45 * Math.PI / 180) * 60
          }}
          transition={{
            duration: 1,
            delay: delay + 0.3,
            ease: "easeOut",
          }}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 10px ${colors[i % colors.length]}`,
          }}
        />
      ))}
    </>
  );
}

// Global state for material drops
type DropCallback = (drops: MaterialDrop[]) => void;
let dropListeners: DropCallback[] = [];

export function triggerMaterialDropAnimation(drops: MaterialDrop[]) {
  dropListeners.forEach(listener => listener(drops));
}

export function useMaterialDropAnimation() {
  const [drops, setDrops] = useState<MaterialDrop[]>([]);

  useEffect(() => {
    const listener = (newDrops: MaterialDrop[]) => {
      setDrops(newDrops);
    };
    dropListeners.push(listener);
    return () => {
      dropListeners = dropListeners.filter(l => l !== listener);
    };
  }, []);

  const clearDrops = useCallback(() => {
    setDrops([]);
  }, []);

  return { drops, clearDrops };
}
