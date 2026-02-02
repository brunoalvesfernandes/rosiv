import { motion, AnimatePresence } from "framer-motion";
import { Skull, Swords, Sparkles, Heart } from "lucide-react";
import { BattleResult } from "@/hooks/useCombat";
import { AvatarFace } from "./AvatarFace";

interface BattleAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  npcName: string;
  result: BattleResult | null;
  playerAvatar?: {
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    faceStyle: string;
    accessory: string | null;
  };
}

// Monster emoji icons based on name
function getMonsterEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("goblin")) return "👺";
  if (lower.includes("lobo") || lower.includes("wolf")) return "🐺";
  if (lower.includes("esqueleto") || lower.includes("skeleton")) return "💀";
  if (lower.includes("dragão") || lower.includes("dragon")) return "🐉";
  if (lower.includes("orc")) return "👹";
  if (lower.includes("slime")) return "🟢";
  if (lower.includes("rato") || lower.includes("rat")) return "🐀";
  if (lower.includes("aranha") || lower.includes("spider")) return "🕷️";
  if (lower.includes("morcego") || lower.includes("bat")) return "🦇";
  if (lower.includes("zumbi") || lower.includes("zombie")) return "🧟";
  if (lower.includes("fantasma") || lower.includes("ghost")) return "👻";
  if (lower.includes("ogro") || lower.includes("ogre")) return "👹";
  if (lower.includes("troll")) return "🧌";
  if (lower.includes("demônio") || lower.includes("demon")) return "😈";
  if (lower.includes("serpente") || lower.includes("snake")) return "🐍";
  return "👾";
}

export function BattleAnimation({ isOpen, onClose, npcName, result, playerAvatar }: BattleAnimationProps) {
  if (!result) return null;

  const monsterEmoji = getMonsterEmoji(npcName);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={onClose}
        >
          <motion.div 
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Battle Stage */}
            <div className="bg-gradient-to-b from-card to-background border border-border rounded-2xl p-6 overflow-hidden">
              
              {/* VS Header */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="text-center mb-6"
              >
                <span className="text-2xl font-display font-bold text-primary">⚔️ COMBATE ⚔️</span>
              </motion.div>

              {/* Fighters */}
              <div className="flex items-center justify-between mb-8">
                {/* Player */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-2 relative">
                    {playerAvatar ? (
                      <AvatarFace
                        hairStyle={playerAvatar.hairStyle}
                        hairColor={playerAvatar.hairColor}
                        eyeColor={playerAvatar.eyeColor}
                        skinTone={playerAvatar.skinTone}
                        faceStyle={playerAvatar.faceStyle}
                        accessory={playerAvatar.accessory}
                        size="lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl">🧙</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium">Você</p>
                </motion.div>

                {/* VS */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Swords className="w-10 h-10 text-destructive" />
                </motion.div>

                {/* Monster */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="text-center"
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-2 rounded-full bg-destructive/20 flex items-center justify-center"
                    animate={result.won ? { 
                      scale: [1, 0.8, 0],
                      rotate: [0, -10, 10, -180],
                      opacity: [1, 0.5, 0]
                    } : {}}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  >
                    <span className="text-4xl">{monsterEmoji}</span>
                  </motion.div>
                  <p className="text-sm font-medium text-destructive">{npcName}</p>
                </motion.div>
              </div>

              {/* Attack Animation */}
              <div className="relative h-24 mb-6">
                {/* Player Attack Slash */}
                <motion.div
                  initial={{ x: "-50%", y: "-50%", scale: 0, rotate: -45 }}
                  animate={{ 
                    x: ["0%", "100%"], 
                    scale: [0, 2, 0],
                    rotate: [-45, 45]
                  }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute top-1/2 left-1/4"
                >
                  <span className="text-4xl">⚡</span>
                </motion.div>

                {/* Damage Numbers - Player hits */}
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [0, -30] }}
                  transition={{ delay: 1.0, duration: 0.8 }}
                  className="absolute top-1/2 right-1/4 text-2xl font-bold text-destructive"
                >
                  -{result.damageDealt}
                </motion.div>

                {/* Monster Attack */}
                <motion.div
                  initial={{ x: "50%", y: "-50%", scale: 0, rotate: 45 }}
                  animate={{ 
                    x: ["100%", "0%"], 
                    scale: [0, 2, 0],
                    rotate: [45, -45]
                  }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute top-1/2 right-1/4"
                >
                  <span className="text-3xl">💥</span>
                </motion.div>

                {/* Damage Numbers - Monster hits */}
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [0, -30] }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="absolute top-1/2 left-1/4 text-xl font-bold text-gold"
                >
                  -{result.damageTaken}
                </motion.div>

                {/* Death animation for monster */}
                {result.won && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1.5, 2, 2.5],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="absolute top-1/2 right-1/3 transform -translate-y-1/2"
                  >
                    <Skull className="w-12 h-12 text-destructive" />
                  </motion.div>
                )}
              </div>

              {/* Result */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.2, type: "spring", damping: 8 }}
                className={`text-center p-4 rounded-xl ${
                  result.won 
                    ? "bg-success/20 border border-success/30" 
                    : "bg-destructive/20 border border-destructive/30"
                }`}
              >
                <motion.h3 
                  className={`text-2xl font-display font-bold mb-2 ${
                    result.won ? "text-success" : "text-destructive"
                  }`}
                  animate={result.won ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: 2, duration: 0.3 }}
                >
                  {result.won ? "🏆 VITÓRIA!" : "💀 DERROTA"}
                </motion.h3>

                {/* Rewards */}
                {result.won && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5 }}
                    className="flex justify-center gap-6 mt-3"
                  >
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-xp" />
                      <span className="text-xp font-bold">+{result.xpGained} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gold">🪙</span>
                      <span className="text-gold font-bold">+{result.goldGained}</span>
                    </div>
                  </motion.div>
                )}

                {/* Level Up */}
                {result.levelUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                    transition={{ delay: 2.8, repeat: Infinity, repeatDelay: 1 }}
                    className="mt-3 text-lg font-bold text-primary"
                  >
                    ⬆️ LEVEL UP! Nível {result.newLevel}
                  </motion.div>
                )}

                {/* Drops */}
                {result.drops.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.0 }}
                    className="mt-3 text-sm text-muted-foreground"
                  >
                    📦 {result.drops.map(d => `${d.materialName} x${d.quantity}`).join(", ")}
                  </motion.div>
                )}
              </motion.div>

              {/* Close hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.2 }}
                className="text-center text-xs text-muted-foreground mt-4"
              >
                Clique em qualquer lugar para fechar
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
