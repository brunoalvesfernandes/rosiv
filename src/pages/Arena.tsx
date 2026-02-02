import { GameLayout } from "@/components/layout/GameLayout";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Swords, 
  Shield,
  Search,
  Skull,
  Trophy,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

// Mock data
const mockPlayer = {
  name: "ShadowSlayer",
  level: 15,
  gold: 2450,
  currentHp: 85,
  maxHp: 100,
  stats: {
    strength: 25,
    defense: 18,
  },
  arenaPoints: 1250,
  arenaRank: 42,
};

const mockOpponents = [
  { 
    id: 1, 
    name: "DarkKnight", 
    level: 14, 
    strength: 22, 
    defense: 20,
    winChance: 65,
  },
  { 
    id: 2, 
    name: "IronFist", 
    level: 15, 
    strength: 24, 
    defense: 16,
    winChance: 55,
  },
  { 
    id: 3, 
    name: "ShadowBane", 
    level: 16, 
    strength: 28, 
    defense: 22,
    winChance: 35,
  },
];

const mockNPCs = [
  { 
    id: 1, 
    name: "Goblin Guerreiro", 
    level: 10, 
    strength: 15, 
    defense: 10,
    xpReward: 80,
    goldReward: 25,
  },
  { 
    id: 2, 
    name: "Orc Berserker", 
    level: 14, 
    strength: 20, 
    defense: 14,
    xpReward: 120,
    goldReward: 45,
  },
  { 
    id: 3, 
    name: "Esqueleto Cavaleiro", 
    level: 16, 
    strength: 25, 
    defense: 18,
    xpReward: 180,
    goldReward: 70,
  },
];

type CombatMode = "pvp" | "pve";

export default function Arena() {
  const [mode, setMode] = useState<CombatMode>("pvp");
  const [isSearching, setIsSearching] = useState(false);

  return (
    <GameLayout 
      playerName={mockPlayer.name} 
      playerLevel={mockPlayer.level}
      playerGold={mockPlayer.gold}
    >
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
              <p className="text-2xl font-bold text-gold">{mockPlayer.arenaPoints}</p>
              <p className="text-xs text-muted-foreground">Pontos de Arena</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">#{mockPlayer.arenaRank}</p>
              <p className="text-xs text-muted-foreground">Ranking</p>
            </div>
          </div>
        </div>

        {/* Player Status */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-4">
            <CharacterAvatar name={mockPlayer.name} level={mockPlayer.level} size="md" />
            <div className="flex-1">
              <h3 className="font-display font-bold">{mockPlayer.name}</h3>
              <ProgressBar 
                variant="health" 
                value={mockPlayer.currentHp} 
                max={mockPlayer.maxHp}
                size="sm"
                showLabel={false}
              />
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Swords className="w-4 h-4 text-primary" />
                  {mockPlayer.stats.strength}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  {mockPlayer.stats.defense}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={mode === "pvp" ? "default" : "secondary"}
            onClick={() => setMode("pvp")}
            className="flex-1 gap-2"
          >
            <Trophy className="w-4 h-4" />
            PvP (Jogadores)
          </Button>
          <Button 
            variant={mode === "pve" ? "default" : "secondary"}
            onClick={() => setMode("pve")}
            className="flex-1 gap-2"
          >
            <Skull className="w-4 h-4" />
            PvE (Monstros)
          </Button>
        </div>

        {/* PvP Mode */}
        {mode === "pvp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Oponentes Disponíveis</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSearching(true)}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSearching ? "animate-spin" : ""}`} />
                Buscar Novos
              </Button>
            </div>

            <div className="grid gap-4">
              {mockOpponents.map((opponent) => (
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
                        opponent.winChance >= 50 ? "text-success" : "text-destructive"
                      }`}>
                        {opponent.winChance}%
                      </p>
                      <p className="text-xs text-muted-foreground">Chance</p>
                    </div>
                    <Button className="gap-2">
                      <Swords className="w-4 h-4" />
                      Atacar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PvE Mode */}
        {mode === "pve" && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Monstros</h2>
            <div className="grid gap-4">
              {mockNPCs.map((npc) => (
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
                      <p className="text-xp">+{npc.xpReward} XP</p>
                      <p className="text-gold">+{npc.goldReward} Ouro</p>
                    </div>
                    <Button className="gap-2">
                      <Swords className="w-4 h-4" />
                      Atacar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
