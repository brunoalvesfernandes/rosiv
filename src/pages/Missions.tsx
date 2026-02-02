import { useState, useEffect } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { MissionCard } from "@/components/game/MissionCard";
import { Button } from "@/components/ui/button";
import { Target, Clock, Star, Trophy, Loader2, CheckCircle } from "lucide-react";
import { useMissions, usePlayerMissions, useStartMission, useCompleteMission, Mission, PlayerMission } from "@/hooks/useMissions";
import { useCharacter } from "@/hooks/useCharacter";
import { playMissionBgm, stopBgm, playMissionCompleteSound } from "@/utils/gameAudio";

type MissionCategory = "all" | "story" | "daily" | "grind" | "boss";

const categories = [
  { id: "all" as const, label: "Todas", icon: Target },
  { id: "story" as const, label: "História", icon: Star },
  { id: "daily" as const, label: "Diárias", icon: Clock },
  { id: "grind" as const, label: "Repetíveis", icon: Target },
  { id: "boss" as const, label: "Boss", icon: Trophy },
];

export default function Missions() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("all");
  
  const { data: missions, isLoading: missionsLoading } = useMissions();
  const { data: playerMissions } = usePlayerMissions();
  const { data: character } = useCharacter();
  const startMission = useStartMission();
  const completeMission = useCompleteMission();

  // Play mission background music
  useEffect(() => {
    playMissionBgm();
    return () => stopBgm();
  }, []);

  const activeMissionIds = new Set(
    playerMissions?.filter(pm => pm.status === "active").map(pm => pm.mission_id) || []
  );

  const getPlayerMission = (missionId: string): (PlayerMission & { mission: Mission }) | undefined => {
    return playerMissions?.find(pm => pm.mission_id === missionId && pm.status === "active");
  };

  const filteredMissions = missions?.filter(
    (mission) => {
      const categoryMatch = activeCategory === "all" || mission.category === activeCategory;
      const levelMatch = (character?.level || 1) >= mission.min_level;
      return categoryMatch && levelMatch;
    }
  ) || [];

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Missões
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete missões para ganhar experiência e ouro
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Loading */}
        {missionsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Missions Grid */}
        {!missionsLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMissions.map((mission) => {
              const isActive = activeMissionIds.has(mission.id);
              const playerMission = getPlayerMission(mission.id);
              const isComplete = playerMission && new Date(playerMission.completes_at) <= new Date();

              return (
                <div key={mission.id} className="relative">
                  <MissionCard
                    title={mission.title}
                    description={mission.description}
                    difficulty={mission.difficulty as "easy" | "medium" | "hard" | "boss"}
                    xpReward={mission.xp_reward}
                    goldReward={mission.gold_reward}
                    duration={mission.duration_minutes}
                    isActive={isActive && !isComplete}
                    onAccept={() => startMission.mutate(mission)}
                  />
                  {isActive && isComplete && playerMission && (
                    <div className="absolute inset-0 bg-card/90 rounded-lg flex items-center justify-center">
                      <Button 
                        onClick={() => completeMission.mutate(playerMission)}
                        disabled={completeMission.isPending}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Coletar Recompensa
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!missionsLoading && filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma missão disponível para seu nível nesta categoria
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
