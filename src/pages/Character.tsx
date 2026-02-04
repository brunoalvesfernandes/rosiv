import { GameLayout } from "@/components/layout/GameLayout";
import { PixelAvatar } from "@/components/game/PixelAvatar";
import { avatarOptions } from "@/data/avatars";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { 
  Swords, 
  Shield, 
  Heart, 
  Zap, 
  Sparkles,
  Plus,
  Loader2,
  Palette
} from "lucide-react";
import { useCharacter, useAddStatPoint } from "@/hooks/useCharacter";
import { useNavigate } from "react-router-dom";

const statConfig = [
  { key: "strength" as const, label: "Força", icon: Swords, description: "Aumenta o dano de ataque" },
  { key: "defense" as const, label: "Defesa", icon: Shield, description: "Reduz o dano recebido" },
  { key: "vitality" as const, label: "Vitalidade", icon: Heart, description: "Aumenta a vida máxima" },
  { key: "agility" as const, label: "Agilidade", icon: Zap, description: "Aumenta chance de esquiva" },
  { key: "luck" as const, label: "Sorte", icon: Sparkles, description: "Aumenta chance de crítico" },
];

export default function Character() {
  const { data: character, isLoading } = useCharacter();
  const addStatPoint = useAddStatPoint();
  const navigate = useNavigate();

  if (isLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Character Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <PixelAvatar
                avatarId={character.avatar_id || avatarOptions[0].id}
                size="xl"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                onClick={() => navigate("/character/customize")}
              >
                <Palette className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="font-display text-3xl font-bold">{character.name}</h1>
              <p className="text-muted-foreground">Guerreiro • Nível {character.level}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{character.total_battles}</p>
                  <p className="text-xs text-muted-foreground">Batalhas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{character.wins}</p>
                  <p className="text-xs text-muted-foreground">Vitórias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gold">{character.missions_completed}</p>
                  <p className="text-xs text-muted-foreground">Missões</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="health" 
              value={character.current_hp} 
              max={character.max_hp}
              label="Vida"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="energy" 
              value={character.current_energy} 
              max={character.max_energy}
              label="Energia"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="mana" 
              value={character.current_mana} 
              max={character.max_mana}
              label="Mana"
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ProgressBar 
              variant="xp" 
              value={character.current_xp} 
              max={character.xp_to_next_level}
              label="Experiência"
            />
          </div>
        </div>

        {/* Available Points Banner */}
        {character.available_points > 0 && (
          <div className="bg-gradient-primary rounded-xl p-4 text-center">
            <p className="text-primary-foreground font-medium">
              Você tem <span className="font-bold text-xl">{character.available_points}</span> pontos de atributo disponíveis!
            </p>
          </div>
        )}

        {/* Attributes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Atributos</h2>
          <div className="space-y-4">
            {statConfig.map((stat) => {
              const Icon = stat.icon;
              const value = character[stat.key];
              
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
                  {character.available_points > 0 && (
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="shrink-0 border-primary/30 hover:border-primary hover:bg-primary/10"
                      onClick={() => addStatPoint.mutate(stat.key)}
                      disabled={addStatPoint.isPending}
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
