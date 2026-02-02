import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, PawPrint, Sparkles, Clock, Zap, Heart, Shield, Sword, Eye, Package, Utensils, ShoppingCart, Smile } from "lucide-react";
import { usePets, getAbilityDescription, getRarityColor, getRarityBg } from "@/hooks/usePets";
import { usePetFeeding, getFoodRarityColor } from "@/hooks/usePetFeeding";
import { cn } from "@/lib/utils";

export default function Pets() {
  const { 
    allPets, 
    playerPets, 
    activePet, 
    isLoading, 
    activatePet, 
    deactivatePet,
    renamePet 
  } = usePets();

  const {
    allFoods,
    playerFoods,
    isLoading: isLoadingFeeding,
    buyFood,
    feedPet,
  } = usePetFeeding();
  
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [feedDialogOpen, setFeedDialogOpen] = useState<string | null>(null);

  if (isLoading || isLoadingFeeding) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const getAbilityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      invisibility: <Eye className="w-4 h-4" />,
      heal: <Heart className="w-4 h-4" />,
      strength_boost: <Sword className="w-4 h-4" />,
      collector: <Package className="w-4 h-4" />,
      shield: <Shield className="w-4 h-4" />,
      speed: <Zap className="w-4 h-4" />,
    };
    return icons[type] || <Sparkles className="w-4 h-4" />;
  };

  const handleRename = (petId: string) => {
    if (newNickname.trim()) {
      renamePet.mutate({ petId, nickname: newNickname.trim() });
      setNewNickname("");
      setSelectedPet(null);
    }
  };

  const handleFeed = (playerPetId: string, foodId: string) => {
    feedPet.mutate({ playerPetId, foodId });
  };

  const getHungerStatus = (hunger: number) => {
    if (hunger >= 80) return { text: "Satisfeito", color: "text-green-500" };
    if (hunger >= 50) return { text: "Normal", color: "text-yellow-500" };
    if (hunger >= 20) return { text: "Com Fome", color: "text-orange-500" };
    return { text: "Faminto!", color: "text-red-500" };
  };

  const getHappinessStatus = (happiness: number) => {
    if (happiness >= 80) return { text: "Feliz", color: "text-green-500" };
    if (happiness >= 50) return { text: "Normal", color: "text-yellow-500" };
    if (happiness >= 20) return { text: "Triste", color: "text-orange-500" };
    return { text: "Deprimido", color: "text-red-500" };
  };

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <PawPrint className="w-8 h-8 text-primary" />
              Meus Pets
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus companheiros e suas habilidades
            </p>
          </div>
        </div>

        {/* Active Pet Display */}
        {activePet && (
          <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Pet Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center text-4xl",
                  getRarityBg(activePet.pet.rarity)
                )}>
                  {activePet.pet.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {activePet.nickname || activePet.pet.name}
                  </p>
                  <p className={cn("text-sm", getRarityColor(activePet.pet.rarity))}>
                    {activePet.pet.name} • Nível {activePet.level}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {getAbilityIcon(activePet.pet.ability_type)}
                    <span>{getAbilityDescription(activePet.pet.ability_type, activePet.pet.ability_value)}</span>
                  </div>
                  {/* Hunger & Happiness bars */}
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Utensils className="w-3 h-3 text-orange-500" />
                      <Progress value={activePet.hunger} className="w-20 h-2" />
                      <span className={getHungerStatus(activePet.hunger).color}>
                        {activePet.hunger}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Smile className="w-3 h-3 text-pink-500" />
                      <Progress value={activePet.happiness} className="w-20 h-2" />
                      <span className={getHappinessStatus(activePet.happiness).color}>
                        {activePet.happiness}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => deactivatePet.mutate()}
                  disabled={deactivatePet.isPending}
                >
                  Desativar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="my-pets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-pets">
              Meus Pets ({playerPets?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="food-shop">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Loja de Ração
            </TabsTrigger>
            <TabsTrigger value="my-food">
              <Utensils className="w-4 h-4 mr-1" />
              Minhas Rações ({playerFoods?.reduce((acc, f) => acc + f.quantity, 0) || 0})
            </TabsTrigger>
            <TabsTrigger value="all-pets">
              Todos os Pets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-pets" className="space-y-4">
            {playerPets && playerPets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playerPets.map((playerPet) => {
                  const hungerStatus = getHungerStatus(playerPet.hunger);
                  const happinessStatus = getHappinessStatus(playerPet.happiness);
                  
                  return (
                    <Card 
                      key={playerPet.id}
                      className={cn(
                        "transition-all hover:shadow-lg",
                        playerPet.is_active && "ring-2 ring-primary"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-14 h-14 rounded-lg flex items-center justify-center text-3xl shrink-0",
                            getRarityBg(playerPet.pet.rarity)
                          )}>
                            {playerPet.pet.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold truncate">
                                {playerPet.nickname || playerPet.pet.name}
                              </p>
                              {playerPet.is_active && (
                                <Badge variant="default" className="shrink-0">Ativo</Badge>
                              )}
                            </div>
                            <p className={cn("text-xs", getRarityColor(playerPet.pet.rarity))}>
                              {playerPet.pet.rarity.charAt(0).toUpperCase() + playerPet.pet.rarity.slice(1)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Nível {playerPet.level}
                            </p>
                          </div>
                        </div>

                        {/* Hunger & Happiness */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Utensils className="w-3 h-3 text-orange-500" />
                            <Progress value={playerPet.hunger} className="flex-1 h-2" />
                            <span className={cn("text-xs", hungerStatus.color)}>
                              {hungerStatus.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Smile className="w-3 h-3 text-pink-500" />
                            <Progress value={playerPet.happiness} className="flex-1 h-2" />
                            <span className={cn("text-xs", happinessStatus.color)}>
                              {happinessStatus.text}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                          {playerPet.pet.strength_bonus > 0 && (
                            <div className="text-xs">
                              <Sword className="w-3 h-3 mx-auto text-red-500" />
                              <span className="text-green-500">+{playerPet.pet.strength_bonus}</span>
                            </div>
                          )}
                          {playerPet.pet.defense_bonus > 0 && (
                            <div className="text-xs">
                              <Shield className="w-3 h-3 mx-auto text-blue-500" />
                              <span className="text-green-500">+{playerPet.pet.defense_bonus}</span>
                            </div>
                          )}
                          {playerPet.pet.agility_bonus > 0 && (
                            <div className="text-xs">
                              <Zap className="w-3 h-3 mx-auto text-yellow-500" />
                              <span className="text-green-500">+{playerPet.pet.agility_bonus}</span>
                            </div>
                          )}
                          {playerPet.pet.vitality_bonus > 0 && (
                            <div className="text-xs">
                              <Heart className="w-3 h-3 mx-auto text-pink-500" />
                              <span className="text-green-500">+{playerPet.pet.vitality_bonus}</span>
                            </div>
                          )}
                          {playerPet.pet.luck_bonus > 0 && (
                            <div className="text-xs">
                              <Sparkles className="w-3 h-3 mx-auto text-purple-500" />
                              <span className="text-green-500">+{playerPet.pet.luck_bonus}</span>
                            </div>
                          )}
                        </div>

                        {/* Ability */}
                        <div className="mt-3 p-2 rounded bg-muted/50 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            {getAbilityIcon(playerPet.pet.ability_type)}
                            <span className="font-medium">Habilidade</span>
                          </div>
                          <p>{getAbilityDescription(playerPet.pet.ability_type, playerPet.pet.ability_value)}</p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Cooldown: {playerPet.pet.ability_cooldown}s</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {!playerPet.is_active ? (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => activatePet.mutate(playerPet.id)}
                              disabled={activatePet.isPending}
                            >
                              {activatePet.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Ativar"
                              )}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => deactivatePet.mutate()}
                              disabled={deactivatePet.isPending}
                            >
                              Desativar
                            </Button>
                          )}

                          {/* Feed Button */}
                          <Dialog open={feedDialogOpen === playerPet.id} onOpenChange={(open) => setFeedDialogOpen(open ? playerPet.id : null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary">
                                <Utensils className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Utensils className="w-5 h-5" />
                                  Alimentar {playerPet.nickname || playerPet.pet.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {playerFoods && playerFoods.length > 0 ? (
                                  <div className="space-y-2">
                                    {playerFoods.map((pf) => (
                                      <div 
                                        key={pf.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                      >
                                        <span className="text-2xl">{pf.food.icon}</span>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{pf.food.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            +{pf.food.hunger_restore} fome, +{pf.food.happiness_restore} felicidade
                                          </p>
                                        </div>
                                        <Badge variant="outline">{pf.quantity}x</Badge>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            handleFeed(playerPet.id, pf.food_id);
                                            setFeedDialogOpen(null);
                                          }}
                                          disabled={feedPet.isPending}
                                        >
                                          Usar
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground">
                                    <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Você não tem rações!</p>
                                    <p className="text-xs mt-1">Compre na Loja de Ração</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Rename Button */}
                          <Dialog open={selectedPet === playerPet.id} onOpenChange={(open) => setSelectedPet(open ? playerPet.id : null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Renomear
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Renomear Pet</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Novo apelido..."
                                  value={newNickname}
                                  onChange={(e) => setNewNickname(e.target.value)}
                                  maxLength={20}
                                />
                                <Button 
                                  className="w-full"
                                  onClick={() => handleRename(playerPet.id)}
                                  disabled={renamePet.isPending || !newNickname.trim()}
                                >
                                  {renamePet.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Salvar"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <PawPrint className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pet ainda</h3>
                  <p className="text-muted-foreground text-sm">
                    Complete missões, eventos ou compre na loja para obter pets!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Food Shop Tab */}
          <TabsContent value="food-shop" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFoods?.map((food) => (
                <Card key={food.id} className="transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-3xl shrink-0">
                        {food.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{food.name}</p>
                        <p className={cn("text-xs", getFoodRarityColor(food.rarity))}>
                          {food.rarity.charAt(0).toUpperCase() + food.rarity.slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {food.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-orange-500">
                          <Utensils className="w-3 h-3" />
                          <span>+{food.hunger_restore} fome</span>
                        </div>
                        <div className="flex items-center gap-1 text-pink-500">
                          <Smile className="w-3 h-3" />
                          <span>+{food.happiness_restore} felicidade</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-bold">🪙 {food.price}</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-3"
                      onClick={() => buyFood.mutate({ foodId: food.id })}
                      disabled={buyFood.isPending}
                    >
                      {buyFood.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Food Tab */}
          <TabsContent value="my-food" className="space-y-4">
            {playerFoods && playerFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playerFoods.map((pf) => (
                  <Card key={pf.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-3xl shrink-0">
                          {pf.food.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{pf.food.name}</p>
                          <p className={cn("text-xs", getFoodRarityColor(pf.food.rarity))}>
                            {pf.food.rarity.charAt(0).toUpperCase() + pf.food.rarity.slice(1)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>+{pf.food.hunger_restore} fome</span>
                            <span>+{pf.food.happiness_restore} felicidade</span>
                          </div>
                        </div>
                        <Badge className="text-lg">{pf.quantity}x</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Utensils className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma ração</h3>
                  <p className="text-muted-foreground text-sm">
                    Compre rações na Loja de Ração para alimentar seus pets!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all-pets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPets?.map((pet) => {
                const owned = playerPets?.some(pp => pp.pet_id === pet.id);
                
                return (
                  <Card 
                    key={pet.id}
                    className={cn(
                      "transition-all",
                      !owned && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-14 h-14 rounded-lg flex items-center justify-center text-3xl shrink-0",
                          getRarityBg(pet.rarity)
                        )}>
                          {pet.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold truncate">{pet.name}</p>
                            {owned && (
                              <Badge variant="secondary" className="shrink-0">Possui</Badge>
                            )}
                          </div>
                          <p className={cn("text-xs", getRarityColor(pet.rarity))}>
                            {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {pet.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                        <div className="text-xs">
                          <Sword className="w-3 h-3 mx-auto text-red-500" />
                          <span className={pet.strength_bonus > 0 ? "text-green-500" : "text-muted-foreground"}>
                            +{pet.strength_bonus}
                          </span>
                        </div>
                        <div className="text-xs">
                          <Shield className="w-3 h-3 mx-auto text-blue-500" />
                          <span className={pet.defense_bonus > 0 ? "text-green-500" : "text-muted-foreground"}>
                            +{pet.defense_bonus}
                          </span>
                        </div>
                        <div className="text-xs">
                          <Zap className="w-3 h-3 mx-auto text-yellow-500" />
                          <span className={pet.agility_bonus > 0 ? "text-green-500" : "text-muted-foreground"}>
                            +{pet.agility_bonus}
                          </span>
                        </div>
                        <div className="text-xs">
                          <Heart className="w-3 h-3 mx-auto text-pink-500" />
                          <span className={pet.vitality_bonus > 0 ? "text-green-500" : "text-muted-foreground"}>
                            +{pet.vitality_bonus}
                          </span>
                        </div>
                        <div className="text-xs">
                          <Sparkles className="w-3 h-3 mx-auto text-purple-500" />
                          <span className={pet.luck_bonus > 0 ? "text-green-500" : "text-muted-foreground"}>
                            +{pet.luck_bonus}
                          </span>
                        </div>
                      </div>

                      {/* Ability */}
                      <div className="mt-3 p-2 rounded bg-muted/50 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          {getAbilityIcon(pet.ability_type)}
                          <span className="font-medium">Habilidade</span>
                        </div>
                        <p>{getAbilityDescription(pet.ability_type, pet.ability_value)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  );
}
