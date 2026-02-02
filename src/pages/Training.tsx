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
  CheckCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useCharacter } from "@/hooks/useCharacter";
import { useActiveTraining, useStartTraining, useCompleteTraining, TrainingSession } from "@/hooks/useTraining";

const trainingOptions = [
  { 
    id: "strength" as const, 
    label: "Força", 
    icon: Swords, 
    description: "Treino intenso de combate",
    energyCost: 10,
    duration: 60,
  },
  { 
    id: "defense" as const, 
    label: "Defesa", 
    icon: Shield, 
    description: "Exercícios de resistência",
    energyCost: 10,
    duration: 60,
  },
  { 
    id: "vitality" as const, 
    label: "Vitalidade", 
    icon: Heart, 
    description: "Treino de resistência física",
    energyCost: 10,
    duration: 60,
  },
  { 
    id: "agility" as const, 
    label: "Agilidade", 
    icon: Zap, 
    description: "Exercícios de velocidade",
    energyCost: 10,
    duration: 60,
  },
  { 
    id: "luck" as const, 
    label: "Sorte", 
    icon: Sparkles, 
    description: "Meditação e foco mental",
    energyCost: 10,
    duration: 60,
  },
];

const statIcons: Record<string, React.ElementType> = {
  strength: Swords,
  defense: Shield,
  vitality: Heart,
  agility: Zap,
  luck: Sparkles,
};

export default function Training() {
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  
  const { data: character, isLoading: charLoading } = useCharacter();
  const { data: activeTrainings, isLoading: trainingsLoading } = useActiveTraining();
  const startTraining = useStartTraining();
  const completeTraining = useCompleteTraining();

  if (charLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const maxSlots = 3;
  const usedSlots = activeTrainings?.length || 0;
  const remainingSlots = maxSlots - usedSlots;

  const handleStartTraining = () => {
    if (selectedTraining) {
      startTraining.mutate({ statType: selectedTraining as any, durationMinutes: 60 });
      setSelectedTraining(null);
    }
  };

  return (
    <GameLayout>
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
              value={character.current_energy} 
              max={character.max_energy}
              label="Energia Disponível"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground font-medium">Slots de Treino</span>
              <span className="text-foreground font-bold">
                {remainingSlots} / {maxSlots} disponíveis
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: maxSlots }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-4 flex-1 rounded-full ${
                    i < usedSlots 
                      ? "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" 
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active Trainings */}
        {!trainingsLoading && activeTrainings && activeTrainings.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              Treinos em Andamento
            </h2>
            {activeTrainings.map((training) => {
              const Icon = statIcons[training.stat_type] || Dumbbell;
              const isComplete = new Date(training.completes_at) <= new Date();
              const timeRemaining = Math.max(0, Math.ceil((new Date(training.completes_at).getTime() - Date.now()) / 60000));
              const totalTime = Math.ceil((new Date(training.completes_at).getTime() - new Date(training.started_at).getTime()) / 60000);
              const progress = isComplete ? 100 : Math.floor(((totalTime - timeRemaining) / totalTime) * 100);

              return (
                <div 
                  key={training.id}
                  className="bg-card border border-primary/30 rounded-xl p-4 shadow-[0_0_20px_hsl(var(--primary)/0.1)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{training.stat_type}</p>
                      <ProgressBar 
                        variant="xp"
                        value={progress}
                        max={100}
                        size="sm"
                        showLabel={false}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {isComplete ? "Pronto para coletar!" : `${timeRemaining} minutos restantes`}
                      </p>
                    </div>
                    {isComplete && (
                      <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => completeTraining.mutate(training)}
                        disabled={completeTraining.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Coletar +{training.stat_gain}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Training Options */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Opções de Treino</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trainingOptions.map((training) => {
              const Icon = training.icon;
              const isSelected = selectedTraining === training.id;
              const hasEnergy = character.current_energy >= training.energyCost;
              const hasSlots = remainingSlots > 0;
              const canTrain = hasEnergy && hasSlots;

              return (
                <div 
                  key={training.id}
                  className={`relative overflow-hidden rounded-xl border p-4 transition-all cursor-pointer ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.2)]" 
                      : "border-border bg-card hover:border-primary/50"
                  } ${!canTrain && "opacity-60 cursor-not-allowed"}`}
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
                      <span className="text-success">+1-2</span>
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
            <Button 
              size="lg" 
              className="gap-2 px-8"
              onClick={handleStartTraining}
              disabled={startTraining.isPending}
            >
              <Dumbbell className="w-5 h-5" />
              {startTraining.isPending ? "Iniciando..." : `Iniciar Treino de ${trainingOptions.find(t => t.id === selectedTraining)?.label}`}
            </Button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
