import { GameLayout } from "@/components/layout/GameLayout";
import { MissionCard } from "@/components/game/MissionCard";
import { Button } from "@/components/ui/button";
import { Target, Clock, Star, Trophy } from "lucide-react";
import { useState } from "react";

// Mock data
const mockPlayer = {
  name: "ShadowSlayer",
  level: 15,
  gold: 2450,
};

type MissionCategory = "all" | "story" | "daily" | "grind" | "boss";

const categories = [
  { id: "all" as const, label: "Todas", icon: Target },
  { id: "story" as const, label: "História", icon: Star },
  { id: "daily" as const, label: "Diárias", icon: Clock },
  { id: "grind" as const, label: "Repetíveis", icon: Target },
  { id: "boss" as const, label: "Boss", icon: Trophy },
];

const mockMissions = [
  {
    id: 1,
    title: "Floresta Sombria",
    description: "Derrote 5 lobos na floresta sombria e traga suas presas como prova.",
    difficulty: "easy" as const,
    xpReward: 150,
    goldReward: 50,
    duration: 5,
    category: "grind",
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
    category: "story",
  },
  {
    id: 3,
    title: "Coleta Diária de Recursos",
    description: "Colete 20 unidades de recursos espalhados pelo mundo.",
    difficulty: "easy" as const,
    xpReward: 100,
    goldReward: 40,
    duration: 10,
    category: "daily",
  },
  {
    id: 4,
    title: "O Dragão Ancião",
    description: "Desafie o Dragão Ancião em seu covil e prove seu valor como guerreiro lendário.",
    difficulty: "boss" as const,
    xpReward: 2000,
    goldReward: 500,
    duration: 60,
    category: "boss",
  },
  {
    id: 5,
    title: "Proteção da Vila",
    description: "Defenda a vila de uma horda de goblins que atacam ao anoitecer.",
    difficulty: "medium" as const,
    xpReward: 400,
    goldReward: 150,
    duration: 20,
    category: "story",
  },
  {
    id: 6,
    title: "Caça aos Bandidos",
    description: "Elimine 10 bandidos que aterrorizam os viajantes na estrada principal.",
    difficulty: "easy" as const,
    xpReward: 180,
    goldReward: 70,
    duration: 8,
    category: "grind",
  },
  {
    id: 7,
    title: "Arena Diária",
    description: "Participe de uma batalha na arena e ganhe recompensas independente do resultado.",
    difficulty: "medium" as const,
    xpReward: 200,
    goldReward: 80,
    duration: 5,
    category: "daily",
  },
  {
    id: 8,
    title: "O Necromante",
    description: "Encontre e derrote o Necromante que está ressuscitando mortos na cripta abandonada.",
    difficulty: "hard" as const,
    xpReward: 800,
    goldReward: 300,
    duration: 30,
    category: "boss",
  },
];

export default function Missions() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("all");

  const filteredMissions = mockMissions.filter(
    (mission) => activeCategory === "all" || mission.category === activeCategory
  );

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

        {/* Missions Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              {...mission}
              onAccept={() => console.log("Accept mission", mission.id)}
            />
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma missão encontrada nesta categoria
            </p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
