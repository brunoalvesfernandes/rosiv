import { GameLayout } from "@/components/layout/GameLayout";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Swords, 
  Shield,
  Skull,
  Trophy,
  RefreshCw,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { useCharacter, useArenaOpponents } from "@/hooks/useCharacter";
import { useNPCs, useAttackNPC, useAttackPlayer, calculateWinChance } from "@/hooks/useCombat";

type CombatMode = "pvp" | "pve";

export default function Arena() {
  const [mode, setMode] = useState<CombatMode>("pve");
  
  const { data: character, isLoading: charLoading } = useCharacter();
  const { data: opponents, isLoading: opponentsLoading, refetch: refetchOpponents } = useArenaOpponents();
  const { data: npcs, isLoading: npcsLoading } = useNPCs();
  const attackNPC = useAttackNPC();
  const attackPlayer = useAttackPlayer();

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

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Swords className="w-8 h-8 text-primary" />
              Arena de Combate
            </h1>
            <p className="text-muted-foreground mt-1">
              Lute contra inimigos e outros jogadores
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{character.arena_points}</p>
              <p className="text-xs text-muted-foreground">Pontos de Arena</p>
            </div>
          </div>
        </div>

        {/* Protection Warning */}
        {isProtected && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-success" />
            <div>
              <p className="font-medium text-success">Proteção de Novato Ativa</p>
              <p className="text-sm text-muted-foreground">
                Você está protegido contra ataques PvP. A proteção expira quando você ataca outro jogador ou após 24h.
              </p>
            </div>
          </div>
        )}

        {/* Player Status */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-4">
            <CharacterAvatar name={character.name} level={character.level} size="md" />
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
                  {character.strength}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  {character.defense}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={mode === "pve" ? "default" : "secondary"}
            onClick={() => setMode("pve")}
            className="flex-1 gap-2"
          >
            <Skull className="w-4 h-4" />
            PvE (Monstros)
          </Button>
          <Button 
            variant={mode === "pvp" ? "default" : "secondary"}
            onClick={() => setMode("pvp")}
            className="flex-1 gap-2"
          >
            <Trophy className="w-4 h-4" />
            PvP (Jogadores)
          </Button>
        </div>

        {/* PvE Mode */}
        {mode === "pve" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Monstros</h2>
            
            {npcsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4">
                {npcs?.filter(npc => npc.level <= character.level + 10).map((npc) => (
                  <div 
                    key={npc.id}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <Skull className="w-6 h-6 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold">{npc.name}</h3>
                        <p className="text-sm text-muted-foreground">Nível {npc.level}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Swords className="w-4 h-4" />
                            {npc.strength}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            {npc.defense}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-xp">+{npc.xp_reward} XP</p>
                        <p className="text-gold">+{npc.gold_reward} Ouro</p>
                      </div>
                      <Button 
                        className="gap-2"
                        onClick={() => attackNPC.mutate(npc)}
                        disabled={attackNPC.isPending || character.current_hp <= 0}
                      >
                        <Swords className="w-4 h-4" />
                        Atacar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PvP Mode */}
        {mode === "pvp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Oponentes Disponíveis</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchOpponents()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Buscar Novos
              </Button>
            </div>

            {opponentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : opponents && opponents.length > 0 ? (
              <div className="grid gap-4">
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
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <CharacterAvatar name={opponent.name} level={opponent.level} size="sm" />
                        <div className="flex-1">
                          <h3 className="font-display font-bold">{opponent.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Swords className="w-4 h-4" />
                              {opponent.strength}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {opponent.defense}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${
                            winChance >= 50 ? "text-success" : "text-destructive"
                          }`}>
                            {winChance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Chance</p>
                        </div>
                        <Button 
                          className="gap-2"
                          onClick={() => attackPlayer.mutate(opponent)}
                          disabled={attackPlayer.isPending || character.current_hp <= 0}
                        >
                          <Swords className="w-4 h-4" />
                          Atacar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum oponente disponível no momento
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Outros jogadores podem estar protegidos ou fora do seu alcance de nível
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  );
}
