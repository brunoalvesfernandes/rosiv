import { GameLayout } from "@/components/layout/GameLayout";
import { AvatarFace } from "@/components/game/AvatarFace";
import { Trophy, Medal, Crown, TrendingUp, Loader2, Shield } from "lucide-react";
import { useRanking, useCharacter, RankedCharacter } from "@/hooks/useCharacter";
import { Badge } from "@/components/ui/badge";

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
  const { data: ranking, isLoading: rankingLoading } = useRanking();
  const { data: myCharacter } = useCharacter();

  // Find my position in ranking
  const myRank = ranking?.findIndex(c => c.user_id === myCharacter?.user_id);
  const myPosition = myRank !== undefined && myRank >= 0 ? myRank + 1 : null;

  // Calculate power for display
  const calculatePower = (c: RankedCharacter) => {
    return (c.strength * 3 + c.defense * 2 + c.vitality * 2 + c.agility * 2 + c.luck) * c.level;
  };

  return (
    <GameLayout>
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
        {myCharacter && myPosition && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">#{myPosition}</p>
                <p className="text-xs text-muted-foreground">Sua posição</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <AvatarFace 
                hairStyle={myCharacter.hair_style}
                hairColor={myCharacter.hair_color}
                eyeColor={myCharacter.eye_color}
                skinTone={myCharacter.skin_tone}
                faceStyle={myCharacter.face_style}
                accessory={myCharacter.accessory}
                size="sm"
              />
              <div className="flex-1">
                <p className="font-display font-bold">{myCharacter.name}</p>
                <p className="text-sm text-muted-foreground">Nível {myCharacter.level}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gold">{myCharacter.arena_points}</p>
                <p className="text-xs text-muted-foreground">Pontos</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xp">{calculatePower(myCharacter)}</p>
                <p className="text-xs text-muted-foreground">Poder</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {rankingLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Top Players */}
        {!rankingLoading && ranking && (
          <div>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Guerreiros
            </h2>
            <div className="space-y-2">
              {ranking.map((player, index) => {
                const rank = index + 1;
                const isMe = player.user_id === myCharacter?.user_id;
                const power = calculatePower(player);

                return (
                  <div 
                    key={player.id}
                    className={`rounded-xl border p-4 transition-all hover:shadow-lg ${
                      isMe ? "bg-primary/10 border-primary/30" : getRankBg(rank)
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <AvatarFace 
                        hairStyle={player.hair_style}
                        hairColor={player.hair_color}
                        eyeColor={player.eye_color}
                        skinTone={player.skin_tone}
                        faceStyle={player.face_style}
                        accessory={player.accessory}
                        size="sm"
                        rank={rank <= 3 ? rank : undefined}
                      />
                      <div className="flex-1">
                        <p className="font-display font-bold">
                          {player.name}
                          {isMe && <span className="text-primary ml-2">(Você)</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Nível {player.level}</p>
                          {player.guild_name && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Shield className="w-3 h-3" />
                              {player.guild_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-gold">{player.arena_points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Pontos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xp">{power.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Poder</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!rankingLoading && (!ranking || ranking.length === 0) && (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum guerreiro no ranking ainda
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Seja o primeiro a entrar na arena!
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
