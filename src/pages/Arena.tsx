import { useEffect, useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { AvatarFace } from "@/components/game/AvatarFace";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Swords, 
  Shield,
  Skull,
  Trophy,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Zap
} from "lucide-react";
import { useCharacter, useArenaOpponents } from "@/hooks/useCharacter";
import { useNPCs, useAttackNPC, useAttackPlayer, calculateWinChance, NPC, BattleResult } from "@/hooks/useCombat";
import { usePets } from "@/hooks/usePets";
import { playBattleHitSound, playVictorySound, playDefeatSound, initAudioOnInteraction } from "@/utils/gameAudio";
import { TurnBasedBattle } from "@/components/game/TurnBasedBattle";
import { BattleAnimation } from "@/components/game/BattleAnimation";
import { generateMaterialDrops, formatDropMessage, Difficulty } from "@/utils/materialDrops";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

type CombatMode = "pvp" | "pve";

export default function Arena() {
  const [mode, setMode] = useState<CombatMode>("pve");
  const [showTurnBattle, setShowTurnBattle] = useState(false);
  const [showPvPBattle, setShowPvPBattle] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [pvpResult, setPvpResult] = useState<BattleResult | null>(null);
  const [currentOpponentName, setCurrentOpponentName] = useState("");
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: character, isLoading: charLoading } = useCharacter();
  const { data: opponents, isLoading: opponentsLoading, refetch: refetchOpponents } = useArenaOpponents();
  const { data: npcs, isLoading: npcsLoading } = useNPCs();
  const { activePet } = usePets();
  const attackPlayer = useAttackPlayer();

  // Initialize audio on interaction
  useEffect(() => {
    initAudioOnInteraction();
  }, []);

  if (charLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const isProtected = character.is_protected && character.protection_until && new Date(character.protection_until) > new Date();

  // Start PvE battle
  const startPvEBattle = (npc: NPC) => {
    if (character.current_hp <= 0) {
      toast.error("Você está sem vida! Descanse primeiro.");
      return;
    }
    setSelectedNpc(npc);
    setShowTurnBattle(true);
  };

  // Handle PvE battle end - process results
  const handlePvEBattleEnd = async (result: BattleResult) => {
    if (!user || !selectedNpc) return;

    try {
      // Get current character state
      const { data: currentChar } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!currentChar) return;

      const newHp = Math.max(0, currentChar.current_hp - result.damageTaken);
      const newXp = currentChar.current_xp + result.xpGained;
      const newGold = currentChar.gold + result.goldGained;

      let newLevel = currentChar.level;
      let xpToNext = currentChar.xp_to_next_level;
      let availablePoints = currentChar.available_points;
      let remainingXp = newXp;

      // Level up check
      while (remainingXp >= xpToNext) {
        remainingXp -= xpToNext;
        newLevel++;
        availablePoints += 5;
        xpToNext = Math.floor(xpToNext * 1.5);
      }

      // Update character
      await supabase
        .from("characters")
        .update({
          current_hp: newHp,
          current_xp: remainingXp,
          xp_to_next_level: xpToNext,
          gold: newGold,
          level: newLevel,
          available_points: availablePoints,
          total_battles: currentChar.total_battles + 1,
          wins: result.won ? currentChar.wins + 1 : currentChar.wins,
        })
        .eq("user_id", user.id);

      // Log battle
      await supabase.from("battle_logs").insert({
        attacker_id: user.id,
        defender_npc_name: selectedNpc.name,
        is_pvp: false,
        winner_id: result.won ? user.id : null,
        attacker_damage: result.damageDealt,
        defender_damage: result.damageTaken,
        xp_gained: result.xpGained,
        gold_gained: result.goldGained,
      });

      // Generate material drops if won
      if (result.won) {
        const levelDiff = selectedNpc.level - currentChar.level;
        let difficulty: Difficulty = "medium";
        if (levelDiff <= -3) difficulty = "easy";
        else if (levelDiff >= 3) difficulty = "hard";
        else if (levelDiff >= 5) difficulty = "boss";

        const drops = await generateMaterialDrops(user.id, "arena_npc", difficulty);
        
        if (newLevel > currentChar.level) {
          toast.success(`⚔️ Vitória! Subiu para nível ${newLevel}!`);
        } else {
          toast.success(`⚔️ Vitória! +${result.xpGained} XP, +${result.goldGained} ouro`);
        }
        
        if (drops.length > 0) {
          toast.success(formatDropMessage(drops), { duration: 5000 });
        }
      } else {
        toast.error(`💀 Derrota! +${result.xpGained} XP de consolo`);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["player-materials"] });

    } catch (error) {
      console.error("Error processing battle result:", error);
    }

    setSelectedNpc(null);
  };

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header - Solo Leveling Style */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-display tracking-widest uppercase text-primary border border-primary/30 rounded-sm bg-primary/5">
              ⟨ SISTEMA DE COMBATE ⟩
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Swords className="w-8 h-8 text-primary animate-glow-pulse" />
              ARENA
            </h1>
            <p className="text-muted-foreground mt-1">
              Derrote monstros e outros caçadores
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center bg-card border border-primary/30 rounded-sm px-4 py-2 system-border">
              <p className="text-2xl font-display font-bold text-gold">{character.arena_points}</p>
              <p className="text-xs text-muted-foreground font-display">PONTOS</p>
            </div>
          </div>
        </div>

        {/* Protection Warning */}
        {isProtected && (
          <div className="bg-success/10 border border-success/30 rounded-sm p-4 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-success" />
            <div>
              <p className="font-medium text-success font-display">Proteção de Novato Ativa</p>
              <p className="text-sm text-muted-foreground">
                Você está protegido contra ataques PvP. A proteção expira quando você ataca outro jogador ou após 24h.
              </p>
            </div>
          </div>
        )}

        {/* Player Status Card */}
        <div className="bg-card border border-border rounded-sm p-4 system-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AvatarFace 
                hairStyle={character.hair_style}
                hairColor={character.hair_color}
                eyeColor={character.eye_color}
                skinTone={character.skin_tone}
                faceStyle={character.face_style}
                accessory={character.accessory}
                size="md"
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-sm font-display">
                {character.level}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold">{character.name}</h3>
              <ProgressBar 
                variant="health" 
                value={character.current_hp} 
                max={character.max_hp}
                size="sm"
                showLabel={false}
              />
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Swords className="w-4 h-4 text-primary" />
                  <span className="font-display">{character.strength}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="font-display">{character.defense}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-gold" />
                  <span className="font-display">{character.agility}</span>
                </span>
              </div>
            </div>
            {activePet && (
              <div className="text-center bg-secondary/50 rounded-sm px-3 py-2">
                <span className="text-2xl">{activePet.pet.icon || "🐾"}</span>
                <p className="text-xs text-muted-foreground mt-1 font-display">
                  {activePet.nickname || activePet.pet.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={mode === "pve" ? "default" : "secondary"}
            onClick={() => setMode("pve")}
            className="flex-1 gap-2 font-display tracking-wide"
          >
            <Skull className="w-4 h-4" />
            MONSTROS
          </Button>
          <Button 
            variant={mode === "pvp" ? "default" : "secondary"}
            onClick={() => setMode("pvp")}
            className="flex-1 gap-2 font-display tracking-wide"
          >
            <Trophy className="w-4 h-4" />
            CAÇADORES
          </Button>
        </div>

        {/* PvE Mode */}
        {mode === "pve" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="font-display text-xl font-bold">MONSTROS DISPONÍVEIS</h2>
            </div>
            
            {npcsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3">
                {npcs?.filter(npc => npc.level <= character.level + 10).map((npc) => {
                  const levelDiff = npc.level - character.level;
                  const difficultyColor = levelDiff <= -3 ? "text-success" 
                    : levelDiff >= 3 ? "text-destructive" 
                    : "text-gold";
                  
                  return (
                    <div 
                      key={npc.id}
                      className="bg-card border border-border rounded-sm p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(200_100%_50%/0.1)] group"
                    >
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-sm bg-destructive/20 border border-destructive/30 flex items-center justify-center">
                          <span className="text-3xl">
                            {npc.name.toLowerCase().includes("goblin") ? "👺" :
                             npc.name.toLowerCase().includes("lobo") ? "🐺" :
                             npc.name.toLowerCase().includes("esqueleto") ? "💀" :
                             npc.name.toLowerCase().includes("orc") ? "👹" :
                             npc.name.toLowerCase().includes("dragão") ? "🐉" : "👾"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold">{npc.name}</h3>
                          <p className={`text-sm ${difficultyColor} font-display`}>
                            Nível {npc.level}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Swords className="w-3 h-3" />
                              {npc.strength}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {npc.defense}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-xp font-display">+{npc.xp_reward} XP</p>
                          <p className="text-gold font-display">+{npc.gold_reward} 🪙</p>
                        </div>
                        <Button 
                          onClick={() => startPvEBattle(npc)}
                          disabled={character.current_hp <= 0}
                          className="gap-2 font-display tracking-wide system-border"
                        >
                          <Swords className="w-4 h-4" />
                          LUTAR
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PvP Mode */}
        {mode === "pvp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-accent rounded-full" />
                <h2 className="font-display text-xl font-bold">CAÇADORES RIVAIS</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchOpponents()}
                className="gap-2 font-display"
              >
                <RefreshCw className="w-4 h-4" />
                BUSCAR
              </Button>
            </div>

            {opponentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : opponents && opponents.length > 0 ? (
              <div className="grid gap-3">
                {opponents.map((opponent) => {
                  const winChance = calculateWinChance(
                    character.strength,
                    character.defense,
                    character.agility,
                    character.luck,
                    opponent.strength,
                    opponent.defense
                  );

                  return (
                    <div 
                      key={opponent.id}
                      className="bg-card border border-border rounded-sm p-4 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_20px_hsl(270_80%_60%/0.1)] group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <AvatarFace 
                            hairStyle={opponent.hair_style}
                            hairColor={opponent.hair_color}
                            eyeColor={opponent.eye_color}
                            skinTone={opponent.skin_tone}
                            faceStyle={opponent.face_style}
                            accessory={opponent.accessory}
                            size="sm"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-xs font-bold px-1 rounded-sm">
                            {opponent.level}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold">{opponent.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Swords className="w-3 h-3" />
                              {opponent.strength}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {opponent.defense}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-display font-bold ${
                            winChance >= 50 ? "text-success" : "text-destructive"
                          }`}>
                            {winChance}%
                          </p>
                          <p className="text-xs text-muted-foreground">CHANCE</p>
                        </div>
                        <Button 
                          variant="secondary"
                          className="gap-2 font-display tracking-wide border border-accent/50 hover:bg-accent/20"
                          onClick={() => {
                            setCurrentOpponentName(opponent.name);
                            attackPlayer.mutate(opponent, {
                              onSuccess: (result) => {
                                setPvpResult(result);
                                setShowPvPBattle(true);
                                playBattleHitSound();
                                setTimeout(() => {
                                  if (result.won) {
                                    playVictorySound();
                                  } else {
                                    playDefeatSound();
                                  }
                                }, 2000);
                              }
                            });
                          }}
                          disabled={attackPlayer.isPending || character.current_hp <= 0}
                        >
                          <Swords className="w-4 h-4" />
                          DESAFIAR
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-sm">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-display">
                  Nenhum caçador disponível
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Outros jogadores podem estar protegidos ou fora do seu alcance
                </p>
              </div>
            )}
          </div>
        )}

        {/* Turn-Based Battle Modal (PvE) */}
        {selectedNpc && (
          <TurnBasedBattle
            isOpen={showTurnBattle}
            onClose={() => {
              setShowTurnBattle(false);
              setSelectedNpc(null);
            }}
            npc={selectedNpc}
            playerStats={{
              name: character.name,
              level: character.level,
              currentHp: character.current_hp,
              maxHp: character.max_hp,
              strength: character.strength,
              defense: character.defense,
              agility: character.agility,
              luck: character.luck,
            }}
            playerAvatar={{
              hairStyle: character.hair_style,
              hairColor: character.hair_color,
              eyeColor: character.eye_color,
              skinTone: character.skin_tone,
              faceStyle: character.face_style,
              accessory: character.accessory,
            }}
            activePet={activePet}
            onBattleEnd={handlePvEBattleEnd}
          />
        )}

        {/* PvP Battle Animation (existing) */}
        <BattleAnimation
          isOpen={showPvPBattle}
          onClose={() => setShowPvPBattle(false)}
          npcName={currentOpponentName}
          result={pvpResult}
          playerAvatar={{
            hairStyle: character.hair_style,
            hairColor: character.hair_color,
            eyeColor: character.eye_color,
            skinTone: character.skin_tone,
            faceStyle: character.face_style,
            accessory: character.accessory,
          }}
        />
      </div>
    </GameLayout>
  );
}