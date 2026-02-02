import { GameLayout } from "@/components/layout/GameLayout";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Swords, 
  Shield, 
  Heart, 
  Zap, 
  Sparkles,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

// Mock data
const mockPlayer = {
  name: "ShadowSlayer",
  level: 15,
  gold: 2450,
  currentEnergy: 40,
  maxEnergy: 50,
  trainingSlots: 3,
  usedSlots: 1,
};

const trainingOptions = [
  { 
    id: "strength", 
    label: "Força", 
    icon: Swords, 
    description: "Treino intenso de combate",
    energyCost: 10,
    duration: 60, // minutes
    statGain: { min: 1, max: 3 },
  },
  { 
    id: "defense", 
    label: "Defesa", 
    icon: Shield, 
    description: "Exercícios de resistência",
    energyCost: 10,
    duration: 60,
    statGain: { min: 1, max: 3 },
  },
  { 
    id: "vitality", 
    label: "Vitalidade", 
    icon: Heart, 
    description: "Treino de resistência física",
    energyCost: 10,
    duration: 60,
    statGain: { min: 1, max: 3 },
  },
  { 
    id: "agility", 
    label: "Agilidade", 
    icon: Zap, 
    description: "Exercícios de velocidade",
    energyCost: 10,
    duration: 60,
    statGain: { min: 1, max: 3 },
  },
  { 
    id: "luck", 
    label: "Sorte", 
    icon: Sparkles, 
    description: "Meditação e foco mental",
    energyCost: 10,
    duration: 60,
    statGain: { min: 1, max: 2 },
  },
];

const activeTraining = {
  id: "strength",
  label: "Força",
  startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
  progress: 50,
};

export default function Training() {
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const remainingSlots = mockPlayer.trainingSlots - mockPlayer.usedSlots;

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
            <Dumbbell className="w-8 h-8 text-primary" />
            Treinamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Treine seus atributos para ficar mais forte
          </p>
        </div>

        {/* Energy & Slots */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="energy" 
              value={mockPlayer.currentEnergy} 
              max={mockPlayer.maxEnergy}
              label="Energia Disponível"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground font-medium">Slots de Treino</span>
              <span className="text-foreground font-bold">
                {remainingSlots} / {mockPlayer.trainingSlots} disponíveis
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: mockPlayer.trainingSlots }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-4 flex-1 rounded-full ${
                    i < mockPlayer.usedSlots 
                      ? "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" 
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active Training */}
        {activeTraining && (
          <div className="bg-card border border-primary/30 rounded-xl p-6 shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <h2 className="font-display text-lg font-bold">Treino em Andamento</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Swords className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{activeTraining.label}</p>
                <ProgressBar 
                  variant="xp"
                  value={activeTraining.progress}
                  max={100}
                  size="sm"
                  showLabel={false}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo restante: 30 minutos
                </p>
              </div>
              <Button variant="secondary" size="sm" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Acelerar
              </Button>
            </div>
          </div>
        )}

        {/* Training Options */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Opções de Treino</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trainingOptions.map((training) => {
              const Icon = training.icon;
              const isSelected = selectedTraining === training.id;
              const hasEnergy = mockPlayer.currentEnergy >= training.energyCost;
              const hasSlots = remainingSlots > 0;
              const canTrain = hasEnergy && hasSlots;

              return (
                <div 
                  key={training.id}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.2)]" 
                      : "border-border bg-card hover:border-primary/50"
                  } ${!canTrain && "opacity-60"}`}
                  onClick={() => canTrain && setSelectedTraining(training.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold">{training.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {training.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Energia:</span>
                      <span className={hasEnergy ? "text-energy" : "text-destructive"}>
                        {training.energyCost}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duração:</span>
                      <span>{training.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ganho:</span>
                      <span className="text-success">
                        +{training.statGain.min}-{training.statGain.max}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Training Button */}
        {selectedTraining && (
          <div className="flex justify-center">
            <Button size="lg" className="gap-2 px-8">
              <Dumbbell className="w-5 h-5" />
              Iniciar Treino de {trainingOptions.find(t => t.id === selectedTraining)?.label}
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
