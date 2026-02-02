import { GameLayout } from "@/components/layout/GameLayout";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Swords, 
  Shield, 
  Heart, 
  Zap, 
  Sparkles,
  Plus
} from "lucide-react";

// Mock data
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
  availablePoints: 5,
  stats: {
    strength: 25,
    defense: 18,
    vitality: 20,
    agility: 15,
    luck: 10,
  },
  totalBattles: 142,
  wins: 98,
  missionsCompleted: 67,
};

const statConfig = [
  { key: "strength", label: "Força", icon: Swords, description: "Aumenta o dano de ataque" },
  { key: "defense", label: "Defesa", icon: Shield, description: "Reduz o dano recebido" },
  { key: "vitality", label: "Vitalidade", icon: Heart, description: "Aumenta a vida máxima" },
  { key: "agility", label: "Agilidade", icon: Zap, description: "Aumenta chance de esquiva" },
  { key: "luck", label: "Sorte", icon: Sparkles, description: "Aumenta chance de crítico" },
];

export default function Character() {
  return (
    <GameLayout 
      playerName={mockPlayer.name} 
      playerLevel={mockPlayer.level}
      playerGold={mockPlayer.gold}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Character Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <CharacterAvatar 
              name={mockPlayer.name} 
              level={mockPlayer.level} 
              size="lg"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="font-display text-3xl font-bold">{mockPlayer.name}</h1>
              <p className="text-muted-foreground">Guerreiro • Nível {mockPlayer.level}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{mockPlayer.totalBattles}</p>
                  <p className="text-xs text-muted-foreground">Batalhas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{mockPlayer.wins}</p>
                  <p className="text-xs text-muted-foreground">Vitórias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gold">{mockPlayer.missionsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Missões</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="health" 
              value={mockPlayer.currentHp} 
              max={mockPlayer.maxHp}
              label="Vida"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="energy" 
              value={mockPlayer.currentEnergy} 
              max={mockPlayer.maxEnergy}
              label="Energia"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="xp" 
              value={mockPlayer.currentXp} 
              max={mockPlayer.xpToNextLevel}
              label="Experiência"
            />
          </div>
        </div>

        {/* Available Points Banner */}
        {mockPlayer.availablePoints > 0 && (
          <div className="bg-gradient-primary rounded-xl p-4 text-center">
            <p className="text-primary-foreground font-medium">
              Você tem <span className="font-bold text-xl">{mockPlayer.availablePoints}</span> pontos de atributo disponíveis!
            </p>
          </div>
        )}

        {/* Attributes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Atributos</h2>
          <div className="space-y-4">
            {statConfig.map((stat) => {
              const Icon = stat.icon;
              const value = mockPlayer.stats[stat.key as keyof typeof mockPlayer.stats];
              
              return (
                <div 
                  key={stat.key}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="p-2 rounded-lg bg-card">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stat.label}</span>
                      <span className="font-bold text-xl">{value}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  {mockPlayer.availablePoints > 0 && (
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="shrink-0 border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
