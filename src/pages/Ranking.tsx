import { GameLayout } from "@/components/layout/GameLayout";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";

// Mock data
const mockPlayer = {
  name: "ShadowSlayer",
  level: 15,
  gold: 2450,
};

const mockRanking = [
  { rank: 1, name: "DragonSlayer", level: 50, power: 15420, arenaPoints: 5200 },
  { rank: 2, name: "NightBlade", level: 48, power: 14800, arenaPoints: 4950 },
  { rank: 3, name: "IronWarrior", level: 47, power: 14200, arenaPoints: 4700 },
  { rank: 4, name: "StormBringer", level: 45, power: 13500, arenaPoints: 4400 },
  { rank: 5, name: "ShadowHunter", level: 44, power: 12900, arenaPoints: 4150 },
  { rank: 6, name: "FireMage", level: 43, power: 12400, arenaPoints: 3900 },
  { rank: 7, name: "ThunderKnight", level: 42, power: 11800, arenaPoints: 3650 },
  { rank: 8, name: "FrostQueen", level: 41, power: 11200, arenaPoints: 3400 },
  { rank: 9, name: "DarkPaladin", level: 40, power: 10600, arenaPoints: 3150 },
  { rank: 10, name: "LightSeeker", level: 39, power: 10000, arenaPoints: 2900 },
  // Player's position
  { rank: 42, name: "ShadowSlayer", level: 15, power: 2450, arenaPoints: 1250, isPlayer: true },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-gold" />;
    case 2:
      return <Medal className="w-6 h-6 text-muted-foreground" />;
    case 3:
      return <Medal className="w-6 h-6 text-bronze" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gold/10 border-gold/30";
    case 2:
      return "bg-muted/50 border-muted-foreground/30";
    case 3:
      return "bg-bronze/10 border-bronze/30";
    default:
      return "bg-card border-border";
  }
};

export default function Ranking() {
  const playerEntry = mockRanking.find(r => r.isPlayer);

  return (
    <GameLayout 
      playerName={mockPlayer.name} 
      playerLevel={mockPlayer.level}
      playerGold={mockPlayer.gold}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-gold" />
            Ranking Global
          </h1>
          <p className="text-muted-foreground mt-1">
            Os guerreiros mais poderosos do reino
          </p>
        </div>

        {/* Player Position */}
        {playerEntry && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">#{playerEntry.rank}</p>
                <p className="text-xs text-muted-foreground">Sua posição</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <CharacterAvatar name={playerEntry.name} level={playerEntry.level} size="sm" />
              <div className="flex-1">
                <p className="font-display font-bold">{playerEntry.name}</p>
                <p className="text-sm text-muted-foreground">Nível {playerEntry.level}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold">{playerEntry.arenaPoints}</p>
                <p className="text-xs text-muted-foreground">Pontos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xp">{playerEntry.power}</p>
                <p className="text-xs text-muted-foreground">Poder</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top 10 Guerreiros
          </h2>
          <div className="space-y-2">
            {mockRanking.filter(r => !r.isPlayer).map((player) => (
              <div 
                key={player.rank}
                className={`rounded-xl border p-4 transition-all hover:shadow-lg ${getRankBg(player.rank)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {getRankIcon(player.rank)}
                  </div>
                  <CharacterAvatar name={player.name} level={player.level} size="sm" />
                  <div className="flex-1">
                    <p className="font-display font-bold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">Nível {player.level}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-gold">{player.arenaPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xp">{player.power.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Poder</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
