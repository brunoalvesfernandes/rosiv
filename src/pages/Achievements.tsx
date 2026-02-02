import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Gift,
  Loader2,
  Check,
  Lock,
  Coins,
  Star,
  Swords,
  Target,
  Crown,
  Medal,
} from "lucide-react";
import {
  useAchievements,
  usePlayerAchievements,
  useClaimAchievement,
  useAchievementStats,
  useCheckAchievements,
  Achievement,
  PlayerAchievement,
} from "@/hooks/useAchievements";
import { useCharacter } from "@/hooks/useCharacter";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  level: Star,
  combat: Swords,
  missions: Target,
  wealth: Coins,
  arena: Medal,
};

const categoryLabels: Record<string, string> = {
  level: "Nível",
  combat: "Combate",
  missions: "Missões",
  wealth: "Riqueza",
  arena: "Arena",
};

function AchievementCard({
  achievement,
  playerAchievement,
  currentProgress,
  onClaim,
  isClaiming,
}: {
  achievement: Achievement;
  playerAchievement?: PlayerAchievement;
  currentProgress: number;
  onClaim?: () => void;
  isClaiming: boolean;
}) {
  const isUnlocked = !!playerAchievement;
  const isClaimed = playerAchievement?.claimed;
  const progressPercent = Math.min(100, (currentProgress / achievement.requirement_value) * 100);
  const CategoryIcon = categoryIcons[achievement.category] || Trophy;

  return (
    <Card
      className={cn(
        "bg-card/50 backdrop-blur border-primary/20 transition-all",
        isUnlocked && !isClaimed && "ring-2 ring-primary/50 shadow-lg shadow-primary/20",
        !isUnlocked && "opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0",
              isUnlocked
                ? "bg-gradient-to-br from-primary to-primary/50"
                : "bg-muted"
            )}
          >
            {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("font-medium", isUnlocked && "text-primary")}>
                {achievement.name}
              </h3>
              {isClaimed && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Resgatado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

            {/* Progress bar for locked achievements */}
            {!isUnlocked && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>
                    {currentProgress}/{achievement.requirement_value}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-primary">
                <Coins className="w-4 h-4" /> {achievement.gold_reward}
              </span>
              <span className="flex items-center gap-1 text-accent-foreground">
                <Star className="w-4 h-4" /> {achievement.xp_reward} XP
              </span>
            </div>
          </div>

          {/* Claim button */}
          {isUnlocked && !isClaimed && onClaim && (
            <Button size="sm" onClick={onClaim} disabled={isClaiming} className="shrink-0">
              {isClaiming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-1" />
                  Resgatar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Achievements() {
  const { data: character } = useCharacter();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: playerAchievements, isLoading: playerAchievementsLoading } = usePlayerAchievements();
  const claimAchievement = useClaimAchievement();
  const stats = useAchievementStats();

  // Check for new achievements
  useCheckAchievements();

  const isLoading = achievementsLoading || playerAchievementsLoading;

  // Group achievements by category
  const categories = ["level", "combat", "missions", "wealth", "arena"];

  const getProgressForAchievement = (achievement: Achievement): number => {
    if (!character) return 0;
    switch (achievement.requirement_type) {
      case "level":
        return character.level;
      case "wins":
        return character.wins;
      case "missions_completed":
        return character.missions_completed;
      case "gold":
        return character.gold;
      case "arena_points":
        return character.arena_points;
      default:
        return 0;
    }
  };

  const getPlayerAchievement = (achievementId: string) =>
    playerAchievements?.find((pa) => pa.achievement_id === achievementId);

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Conquistas</h1>
            <p className="text-muted-foreground">Complete marcos para ganhar recompensas</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desbloqueadas</p>
                <p className="text-2xl font-bold">
                  {stats.unlocked}/{stats.total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resgatadas</p>
                <p className="text-2xl font-bold">{stats.claimed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.unclaimed}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{stats.percentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span>
              {stats.unlocked} de {stats.total} conquistas
            </span>
          </div>
          <Progress value={stats.percentage} className="h-3" />
        </div>

        {/* Achievements by Category */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full max-w-2xl flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger key={cat} value={cat} className="flex-1 gap-1">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {achievements?.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    playerAchievement={getPlayerAchievement(achievement.id)}
                    currentProgress={getProgressForAchievement(achievement)}
                    onClaim={() => {
                      const pa = getPlayerAchievement(achievement.id);
                      if (pa) claimAchievement.mutate(pa);
                    }}
                    isClaiming={claimAchievement.isPending}
                  />
                ))}
              </div>
            </TabsContent>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-6">
                <div className="space-y-4">
                  {achievements
                    ?.filter((a) => a.category === cat)
                    .map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        playerAchievement={getPlayerAchievement(achievement.id)}
                        currentProgress={getProgressForAchievement(achievement)}
                        onClaim={() => {
                          const pa = getPlayerAchievement(achievement.id);
                          if (pa) claimAchievement.mutate(pa);
                        }}
                        isClaiming={claimAchievement.isPending}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </GameLayout>
  );
}
