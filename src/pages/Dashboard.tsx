import { GameLayout } from "@/components/layout/GameLayout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GameAvatar } from "@/components/game/GameAvatar";
import { 
  Swords, 
  Shield, 
  Heart, 
  Zap, 
  Star,
  TrendingUp,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useCharacter } from "@/hooks/useCharacter";
import { usePlayerMissions, useCompleteMission } from "@/hooks/useMissions";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: character, isLoading: charLoading } = useCharacter();
  const { data: playerMissions, isLoading: missionsLoading } = usePlayerMissions();
  const completeMission = useCompleteMission();

  if (charLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const activeMissions = playerMissions?.filter(m => m.status === "active") || [];

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <GameAvatar 
              size="lg"
              showLevel
            />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Bem-vindo, {character.name}!
              </h1>
              <p className="text-muted-foreground">
                Continue sua jornada e conquiste o reino
              </p>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ProgressBar 
            variant="health" 
            value={character.current_hp} 
            max={character.max_hp}
            label="Vida"
          />
          <ProgressBar 
            variant="energy" 
            value={character.current_energy} 
            max={character.max_energy}
            label="Energia"
          />
          <ProgressBar 
            variant="mana" 
            value={character.current_mana} 
            max={character.max_mana}
            label="Mana"
          />
          <ProgressBar 
            variant="xp" 
            value={character.current_xp} 
            max={character.xp_to_next_level}
            label="Experiência"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Swords} 
            label="Força" 
            value={character.strength}
            variant="primary"
          />
          <StatCard 
            icon={Shield} 
            label="Defesa" 
            value={character.defense}
            variant="default"
          />
          <StatCard 
            icon={Heart} 
            label="Vitalidade" 
            value={character.vitality}
            variant="default"
          />
          <StatCard 
            icon={Zap} 
            label="Agilidade" 
            value={character.agility}
            variant="default"
          />
        </div>

        {/* Active Missions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              Missões Ativas ({activeMissions.length})
            </h2>
            <Link 
              to="/missions" 
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Ver todas
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          {missionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : activeMissions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Você não tem missões ativas
              </p>
              <Link to="/missions">
                <Button>Ver Missões Disponíveissssssssss</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeMissions.slice(0, 3).map((playerMission) => {
                const mission = playerMission.mission;
                const isComplete = new Date(playerMission.completes_at) <= new Date();
                const timeRemaining = Math.max(0, Math.ceil((new Date(playerMission.completes_at).getTime() - Date.now()) / 60000));

                return (
                  <div key={playerMission.id} className="bg-card border border-primary/30 rounded-xl p-4 shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
                    <h3 className="font-display font-bold">{mission.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {mission.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      {isComplete ? (
                        <Button 
                          size="sm" 
                          onClick={() => completeMission.mutate(playerMission)}
                          disabled={completeMission.isPending}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Coletar Recompensa
                        </Button>
                      ) : (
                        <span className="text-sm text-primary animate-pulse">
                          {timeRemaining} min restantes
                        </span>
                      )}
                      <div className="text-right text-sm">
                        <span className="text-xp">+{mission.xp_reward} XP</span>
                        <span className="text-gold ml-2">+{mission.gold_reward}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
