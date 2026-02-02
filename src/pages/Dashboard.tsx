import { GameLayout } from "@/components/layout/GameLayout";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MissionCard } from "@/components/game/MissionCard";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { 
  Swords, 
  Shield, 
  Heart, 
  Zap, 
  Star,
  TrendingUp
} from "lucide-react";

// Mock data - will be replaced with real data from Supabase
const mockPlayer = {
  name: "ShadowSlayer",
  level: 15,
  gold: 2450,
  currentHp: 85,
  maxHp: 100,
  currentEnergy: 40,
  maxEnergy: 50,
  currentXp: 7500,
  xpToNextLevel: 10000,
  stats: {
    strength: 25,
    defense: 18,
    vitality: 20,
    agility: 15,
    luck: 10,
  },
};

const mockMissions = [
  {
    id: 1,
    title: "Floresta Sombria",
    description: "Derrote 5 lobos na floresta sombria e traga suas presas como prova.",
    difficulty: "easy" as const,
    xpReward: 150,
    goldReward: 50,
    duration: 5,
    isActive: true,
  },
  {
    id: 2,
    title: "O Guardião da Caverna",
    description: "Entre na caverna e derrote o Golem de Pedra que guarda o tesouro antigo.",
    difficulty: "medium" as const,
    xpReward: 350,
    goldReward: 120,
    duration: 15,
  },
  {
    id: 3,
    title: "Coleta de Ervas",
    description: "Colete 10 ervas medicinais para o curandeiro da vila.",
    difficulty: "easy" as const,
    xpReward: 80,
    goldReward: 30,
    duration: 3,
    isCompleted: true,
  },
];

export default function Dashboard() {
  return (
    <GameLayout 
      playerName={mockPlayer.name} 
      playerLevel={mockPlayer.level}
      playerGold={mockPlayer.gold}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CharacterAvatar 
              name={mockPlayer.name} 
              level={mockPlayer.level} 
              size="lg"
            />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Bem-vindo, {mockPlayer.name}!
              </h1>
              <p className="text-muted-foreground">
                Continue sua jornada e conquiste o reino
              </p>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid gap-4 md:grid-cols-3">
          <ProgressBar 
            variant="health" 
            value={mockPlayer.currentHp} 
            max={mockPlayer.maxHp}
            label="Vida"
          />
          <ProgressBar 
            variant="energy" 
            value={mockPlayer.currentEnergy} 
            max={mockPlayer.maxEnergy}
            label="Energia"
          />
          <ProgressBar 
            variant="xp" 
            value={mockPlayer.currentXp} 
            max={mockPlayer.xpToNextLevel}
            label="Experiência"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={Swords} 
            label="Força" 
            value={mockPlayer.stats.strength}
            variant="primary"
          />
          <StatCard 
            icon={Shield} 
            label="Defesa" 
            value={mockPlayer.stats.defense}
            variant="default"
          />
          <StatCard 
            icon={Heart} 
            label="Vitalidade" 
            value={mockPlayer.stats.vitality}
            variant="default"
          />
          <StatCard 
            icon={Zap} 
            label="Agilidade" 
            value={mockPlayer.stats.agility}
            variant="default"
          />
        </div>

        {/* Active Missions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              Missões Ativas
            </h2>
            <a 
              href="/missions" 
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Ver todas
              <TrendingUp className="w-4 h-4" />
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockMissions.map((mission) => (
              <MissionCard 
                key={mission.id}
                {...mission}
                onAccept={() => console.log("Accept mission", mission.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
