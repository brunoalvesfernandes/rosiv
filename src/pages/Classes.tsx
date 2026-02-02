import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useCharacter } from "@/hooks/useCharacter";
import { useChangeClass, useSkill, CLASS_DATA, CharacterClass } from "@/hooks/useClasses";

export default function Classes() {
  const { data: character, isLoading } = useCharacter();
  const changeClass = useChangeClass();
  const useSkillMutation = useSkill();

  const currentClass = (character?.class as CharacterClass) || "warrior";
  const classInfo = CLASS_DATA[currentClass];

  if (isLoading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Classes
          </h1>
          <p className="text-muted-foreground">Escolha sua especialização de combate</p>
        </div>

        {/* Current Class */}
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{classInfo.icon}</span>
              Sua Classe: {classInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{classInfo.description}</p>
            <p className="text-sm">
              <span className="text-primary font-medium">Atributo Principal:</span>{" "}
              {classInfo.primaryStat}
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Habilidades de {classInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {classInfo.skills.map((skill, index) => (
                <Card key={index} className="bg-secondary/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{skill.name}</h3>
                      <Badge variant={skill.type === "attack" ? "destructive" : "secondary"}>
                        {skill.type === "attack" ? "Ataque" : skill.type === "buff" ? "Buff" : "Cura"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Custo: <span className="text-blue-400">{skill.manaCost} Mana</span>
                      </span>
                      {skill.damage > 0 && (
                        <span className="text-xs text-destructive">{skill.damage} dano</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() =>
                        useSkillMutation.mutate({
                          skillIndex: index,
                          characterClass: currentClass,
                        })
                      }
                      disabled={
                        useSkillMutation.isPending ||
                        (character?.current_mana || 0) < skill.manaCost
                      }
                    >
                      {useSkillMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Usar Habilidade"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Class */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle>Mudar de Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.values(CLASS_DATA).map((cls) => {
                const isSelected = cls.id === currentClass;
                return (
                  <Card
                    key={cls.id}
                    className={`transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="text-center mb-3">
                        <span className="text-4xl">{cls.icon}</span>
                        <h3 className="font-bold mt-2">{cls.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        {cls.description}
                      </p>
                      <Button
                        className="w-full"
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => changeClass.mutate(cls.id)}
                        disabled={isSelected || changeClass.isPending}
                      >
                        {isSelected ? "Classe Atual" : "Selecionar"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  );
}
