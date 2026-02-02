import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, 
  Shield, 
  Zap, 
  Heart, 
  Skull, 
  Timer, 
  Sparkles,
  PawPrint,
  Flame,
  Wind,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AvatarFace } from "./AvatarFace";
import { NPC, BattleResult } from "@/hooks/useCombat";
import { PlayerPet, Pet } from "@/hooks/usePets";
import { playBattleHitSound, playVictorySound, playDefeatSound } from "@/utils/gameAudio";

interface TurnBasedBattleProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NPC;
  playerStats: {
    name: string;
    level: number;
    currentHp: number;
    maxHp: number;
    strength: number;
    defense: number;
    agility: number;
    luck: number;
  };
  playerAvatar?: {
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    faceStyle: string;
    accessory: string | null;
  };
  activePet?: (PlayerPet & { pet: Pet }) | null;
  onBattleEnd: (result: BattleResult) => void;
}

type BattlePhase = "intro" | "player_turn" | "enemy_turn" | "result";
type SkillType = "attack" | "heavy_attack" | "defend" | "pet_ability";

interface BattleState {
  playerHp: number;
  enemyHp: number;
  playerDefending: boolean;
  petCooldown: number;
  turn: number;
  logs: string[];
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

const TURN_TIME = 8; // seconds to make a move

export function TurnBasedBattle({
  isOpen,
  onClose,
  npc,
  playerStats,
  playerAvatar,
  activePet,
  onBattleEnd,
}: TurnBasedBattleProps) {
  const [phase, setPhase] = useState<BattlePhase>("intro");
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: playerStats.currentHp,
    enemyHp: npc.hp,
    playerDefending: false,
    petCooldown: 0,
    turn: 1,
    logs: [],
  });
  const [showDamage, setShowDamage] = useState<{ player?: number; enemy?: number } | null>(null);
  const [attackAnimation, setAttackAnimation] = useState<"player" | "enemy" | null>(null);

  const monsterEmoji = getMonsterEmoji(npc.name);

  // Calculate damage
  const calculateDamage = useCallback((attackerStrength: number, defenderDefense: number, multiplier = 1) => {
    const baseDamage = attackerStrength * 2 * multiplier;
    const reduction = defenderDefense * 0.5;
    const damage = Math.max(1, baseDamage - reduction);
    const variance = damage * 0.2;
    return Math.floor(damage + (Math.random() * variance * 2 - variance));
  }, []);

  // Reset battle when opened
  useEffect(() => {
    if (isOpen) {
      setPhase("intro");
      setTimeLeft(TURN_TIME);
      setBattleState({
        playerHp: playerStats.currentHp,
        enemyHp: npc.hp,
        playerDefending: false,
        petCooldown: activePet ? 0 : 999,
        turn: 1,
        logs: [],
      });
      
      // Start battle after intro
      const introTimer = setTimeout(() => {
        setPhase("player_turn");
      }, 1500);

      return () => clearTimeout(introTimer);
    }
  }, [isOpen, playerStats.currentHp, npc.hp, activePet]);

  // Timer countdown during player turn
  useEffect(() => {
    if (phase !== "player_turn") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - skip turn
          handleSkipTurn();
          return TURN_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Handle player action
  const handlePlayerAction = useCallback((skill: SkillType) => {
    if (phase !== "player_turn") return;

    setAttackAnimation("player");
    playBattleHitSound();

    let damage = 0;
    let logMessage = "";
    let newPetCooldown = battleState.petCooldown;
    let newPlayerHp = battleState.playerHp;

    switch (skill) {
      case "attack":
        damage = calculateDamage(playerStats.strength, npc.defense);
        logMessage = `Você atacou causando ${damage} de dano!`;
        break;
      case "heavy_attack":
        // Heavy attack: more damage but less accurate
        if (Math.random() > 0.3) {
          damage = calculateDamage(playerStats.strength, npc.defense, 1.8);
          logMessage = `Ataque pesado! ${damage} de dano crítico!`;
        } else {
          logMessage = "Ataque pesado errou!";
        }
        break;
      case "defend":
        logMessage = "Você se defendeu! Dano reduzido no próximo turno.";
        setBattleState(prev => ({ ...prev, playerDefending: true }));
        break;
      case "pet_ability":
        if (activePet && battleState.petCooldown === 0) {
          const abilityType = activePet.pet.ability_type;
          const abilityValue = activePet.pet.ability_value;
          
          switch (abilityType) {
            case "heal":
              // Heal ability - restores HP based on ability value percentage
              const healAmount = Math.floor(playerStats.maxHp * (abilityValue / 100));
              newPlayerHp = Math.min(playerStats.maxHp, battleState.playerHp + healAmount);
              logMessage = `${activePet.nickname || activePet.pet.name} curou você em ${healAmount} HP! ❤️`;
              break;
            case "strength_boost":
              // Temporary strength boost - deals extra damage this turn
              damage = calculateDamage(playerStats.strength * (1 + abilityValue / 100), npc.defense, 1.5);
              logMessage = `${activePet.nickname || activePet.pet.name} potencializou seu ataque! ${damage} de dano! ⚔️`;
              break;
            case "shield":
              // Shield ability - activates defense and deals some damage
              damage = calculateDamage(playerStats.strength * 0.5, npc.defense * 0.5);
              setBattleState(prev => ({ ...prev, playerDefending: true }));
              logMessage = `${activePet.nickname || activePet.pet.name} criou um escudo e atacou causando ${damage}! 🛡️`;
              break;
            default:
              // Default attack for other ability types
              const petDamage = calculateDamage(activePet.pet.strength_bonus * 5 + playerStats.strength * 0.5, npc.defense * 0.5);
              damage = petDamage;
              logMessage = `${activePet.nickname || activePet.pet.name} atacou causando ${petDamage} de dano!`;
          }
          newPetCooldown = 3; // 3 turns cooldown
        }
        break;
    }

    const newEnemyHp = Math.max(0, battleState.enemyHp - damage);

    setBattleState(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      enemyHp: newEnemyHp,
      petCooldown: newPetCooldown,
      logs: [...prev.logs, logMessage],
    }));

    setShowDamage({ enemy: damage > 0 ? damage : undefined });

    setTimeout(() => {
      setAttackAnimation(null);
      setShowDamage(null);

      if (newEnemyHp <= 0) {
        // Victory!
        setPhase("result");
        playVictorySound();
      } else {
        // Enemy turn
        setPhase("enemy_turn");
        setTimeout(() => handleEnemyTurn(), 800);
      }
    }, 600);
  }, [phase, battleState, playerStats, npc, activePet, calculateDamage]);

  // Handle skip turn (time ran out)
  const handleSkipTurn = useCallback(() => {
    setBattleState(prev => ({
      ...prev,
      logs: [...prev.logs, "Você perdeu a vez!"],
    }));
    setPhase("enemy_turn");
    setTimeout(() => handleEnemyTurn(), 500);
  }, []);

  // Handle enemy turn
  const handleEnemyTurn = useCallback(() => {
    setAttackAnimation("enemy");
    playBattleHitSound();

    let damage = calculateDamage(npc.strength, playerStats.defense);
    
    // Reduce damage if player was defending
    if (battleState.playerDefending) {
      damage = Math.floor(damage * 0.4);
    }

    const newPlayerHp = Math.max(0, battleState.playerHp - damage);

    setBattleState(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      playerDefending: false,
      petCooldown: Math.max(0, prev.petCooldown - 1),
      turn: prev.turn + 1,
      logs: [...prev.logs, `${npc.name} atacou causando ${damage} de dano!`],
    }));

    setShowDamage({ player: damage });

    setTimeout(() => {
      setAttackAnimation(null);
      setShowDamage(null);

      if (newPlayerHp <= 0) {
        // Defeat
        setPhase("result");
        playDefeatSound();
      } else {
        // Back to player turn
        setPhase("player_turn");
        setTimeLeft(TURN_TIME);
      }
    }, 600);
  }, [battleState, npc, playerStats, calculateDamage]);

  // Calculate final result
  const getBattleResult = useCallback((): BattleResult => {
    const won = battleState.enemyHp <= 0;
    const damageDealt = npc.hp - battleState.enemyHp;
    const damageTaken = playerStats.currentHp - battleState.playerHp;
    
    return {
      won,
      damageDealt,
      damageTaken,
      xpGained: won ? npc.xp_reward : Math.floor(npc.xp_reward * 0.1),
      goldGained: won ? npc.gold_reward : 0,
      arenaPointsChange: 0,
      levelUp: false,
      newLevel: playerStats.level,
      drops: [],
    };
  }, [battleState, npc, playerStats]);

  // Handle battle end
  const handleEndBattle = useCallback(() => {
    const result = getBattleResult();
    onBattleEnd(result);
    onClose();
  }, [getBattleResult, onBattleEnd, onClose]);

  if (!isOpen) return null;

  const playerHpPercent = (battleState.playerHp / playerStats.maxHp) * 100;
  const enemyHpPercent = (battleState.enemyHp / npc.hp) * 100;
  const won = battleState.enemyHp <= 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-2xl mx-4"
        >
          {/* Battle Arena */}
          <div className="bg-gradient-to-b from-card via-card to-background border border-primary/30 rounded-sm overflow-hidden system-border">
            
            {/* Header - System Style */}
            <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" />
                <span className="font-display text-sm tracking-wider text-primary">SISTEMA DE COMBATE</span>
              </div>
              <div className="text-xs text-muted-foreground font-display">
                TURNO {battleState.turn}
              </div>
            </div>

            {/* Battle Field */}
            <div className="p-6">
              
              {/* Combatants */}
              <div className="flex items-start justify-between mb-6">
                
                {/* Player Side */}
                <motion.div 
                  className="flex-1 text-center"
                  animate={attackAnimation === "player" ? { x: [0, 50, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative inline-block">
                    <div className={`w-24 h-24 mx-auto mb-2 rounded-sm border-2 ${
                      battleState.playerDefending 
                        ? "border-primary bg-primary/20" 
                        : "border-border bg-card"
                    } flex items-center justify-center overflow-hidden`}>
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
                        <span className="text-5xl">🧙</span>
                      )}
                    </div>
                    {battleState.playerDefending && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Shield className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                    {showDamage?.player && (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -40 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl font-bold text-destructive"
                      >
                        -{showDamage.player}
                      </motion.div>
                    )}
                  </div>
                  
                  <p className="font-display font-bold text-sm mb-1">{playerStats.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">Nv. {playerStats.level}</p>
                  
                  {/* Player HP Bar */}
                  <div className="max-w-32 mx-auto">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <Heart className="w-3 h-3 text-health" />
                      <span className="text-health">{battleState.playerHp}/{playerStats.maxHp}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-sm overflow-hidden">
                      <motion.div
                        className="h-full bg-health"
                        initial={{ width: "100%" }}
                        animate={{ width: `${playerHpPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center px-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Swords className="w-10 h-10 text-primary" />
                  </motion.div>
                  <span className="text-xs text-muted-foreground mt-1 font-display">VS</span>
                </div>

                {/* Enemy Side */}
                <motion.div 
                  className="flex-1 text-center"
                  animate={attackAnimation === "enemy" ? { x: [0, -50, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative inline-block">
                    <motion.div 
                      className="w-24 h-24 mx-auto mb-2 rounded-sm border-2 border-destructive/50 bg-destructive/10 flex items-center justify-center"
                      animate={battleState.enemyHp <= 0 ? { 
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.8, 0.5],
                        rotate: [0, 10, -10]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-5xl">{monsterEmoji}</span>
                    </motion.div>
                    {showDamage?.enemy && (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -40 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl font-bold text-primary"
                      >
                        -{showDamage.enemy}
                      </motion.div>
                    )}
                  </div>
                  
                  <p className="font-display font-bold text-sm text-destructive mb-1">{npc.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">Nv. {npc.level}</p>
                  
                  {/* Enemy HP Bar */}
                  <div className="max-w-32 mx-auto">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <Skull className="w-3 h-3 text-destructive" />
                      <span className="text-destructive">{battleState.enemyHp}/{npc.hp}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-sm overflow-hidden">
                      <motion.div
                        className="h-full bg-destructive"
                        initial={{ width: "100%" }}
                        animate={{ width: `${enemyHpPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Battle Log */}
              <div className="bg-secondary/30 border border-border rounded-sm p-3 mb-4 h-20 overflow-y-auto">
                {battleState.logs.slice(-3).map((log, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-muted-foreground"
                  >
                    <span className="text-primary mr-1">›</span> {log}
                  </motion.p>
                ))}
                {battleState.logs.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Batalha iniciada...</p>
                )}
              </div>

              {/* Intro Phase */}
              {phase === "intro" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  className="text-center py-4"
                >
                  <span className="text-3xl font-display font-bold text-primary">⚔️ PREPARE-SE! ⚔️</span>
                </motion.div>
              )}

              {/* Player Turn - Action Buttons */}
              {phase === "player_turn" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer className={`w-5 h-5 ${timeLeft <= 3 ? "text-destructive animate-pulse" : "text-primary"}`} />
                    <div className="w-40 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${timeLeft <= 3 ? "bg-destructive" : "bg-primary"}`}
                        animate={{ width: `${(timeLeft / TURN_TIME) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`font-display font-bold text-lg ${timeLeft <= 3 ? "text-destructive" : "text-primary"}`}>
                      {timeLeft}s
                    </span>
                  </div>

                  {/* Skill Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Basic Attack */}
                    <Button
                      onClick={() => handlePlayerAction("attack")}
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-foreground"
                    >
                      <Swords className="w-6 h-6 text-primary" />
                      <span className="text-xs font-display">ATACAR</span>
                    </Button>

                    {/* Heavy Attack */}
                    <Button
                      onClick={() => handlePlayerAction("heavy_attack")}
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-destructive/20 hover:bg-destructive/40 border border-destructive/50 text-foreground"
                    >
                      <Flame className="w-6 h-6 text-destructive" />
                      <span className="text-xs font-display">PESADO</span>
                      <span className="text-[10px] text-muted-foreground">70% acerto</span>
                    </Button>

                    {/* Defend */}
                    <Button
                      onClick={() => handlePlayerAction("defend")}
                      disabled={battleState.playerDefending}
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-accent/20 hover:bg-accent/40 border border-accent/50 text-foreground disabled:opacity-50"
                    >
                      <Shield className="w-6 h-6 text-accent" />
                      <span className="text-xs font-display">DEFENDER</span>
                      <span className="text-[10px] text-muted-foreground">-60% dano</span>
                    </Button>

                    {/* Pet Ability */}
                    <Button
                      onClick={() => handlePlayerAction("pet_ability")}
                      disabled={!activePet || battleState.petCooldown > 0}
                      className="flex flex-col items-center gap-1 h-auto py-3 bg-gold/20 hover:bg-gold/40 border border-gold/50 text-foreground disabled:opacity-50"
                    >
                      <PawPrint className="w-6 h-6 text-gold" />
                      <span className="text-xs font-display">
                        {activePet ? (activePet.nickname || activePet.pet.name).slice(0, 8) : "SEM PET"}
                      </span>
                      {battleState.petCooldown > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          CD: {battleState.petCooldown}
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Enemy Turn */}
              {phase === "enemy_turn" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <span className="text-xl font-display text-destructive animate-pulse">
                    {npc.name} está atacando...
                  </span>
                </motion.div>
              )}

              {/* Result Phase */}
              {phase === "result" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className={`p-4 rounded-sm border ${
                    won 
                      ? "bg-success/20 border-success/50" 
                      : "bg-destructive/20 border-destructive/50"
                  }`}>
                    <motion.h2
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: 2, duration: 0.3 }}
                      className={`text-3xl font-display font-bold mb-2 ${
                        won ? "text-success" : "text-destructive"
                      }`}
                    >
                      {won ? "🏆 VITÓRIA!" : "💀 DERROTA"}
                    </motion.h2>

                    {won && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center gap-6"
                      >
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-xp" />
                          <span className="text-xp font-bold">+{npc.xp_reward} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gold">🪙</span>
                          <span className="text-gold font-bold">+{npc.gold_reward}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <Button
                    onClick={handleEndBattle}
                    className="font-display tracking-wide"
                  >
                    CONTINUAR
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}