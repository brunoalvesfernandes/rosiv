import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hammer,
  Package,
  Loader2,
  Check,
  X,
  Sparkles,
  Pickaxe,
} from "lucide-react";
import {
  useMaterials,
  usePlayerMaterials,
  useRecipes,
  useCraftItem,
  Material,
  Recipe,
} from "@/hooks/useCrafting";
import { useCharacter } from "@/hooks/useCharacter";
 import { GameAvatar } from "@/components/game/GameAvatar";
import { cn } from "@/lib/utils";
import { MiningGame } from "@/components/game/MiningGame";

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground border-muted",
  uncommon: "text-green-500 border-green-500/50",
  rare: "text-blue-500 border-blue-500/50",
  epic: "text-purple-500 border-purple-500/50",
  legendary: "text-amber-500 border-amber-500/50",
};

const rarityBg: Record<string, string> = {
  common: "bg-muted/20",
  uncommon: "bg-green-500/10",
  rare: "bg-blue-500/10",
  epic: "bg-purple-500/10",
  legendary: "bg-amber-500/10",
};

function MaterialCard({ material, quantity }: { material: Material; quantity: number }) {
  return (
    <Card className={cn("bg-card/50 backdrop-blur border-primary/20", rarityBg[material.rarity])}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{material.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-medium", rarityColors[material.rarity])}>{material.name}</h3>
              <Badge variant="outline" className={rarityColors[material.rarity]}>
                {material.rarity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{material.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Fonte: {material.drop_source}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{quantity}</span>
            <p className="text-xs text-muted-foreground">unidades</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecipeCard({
  recipe,
  playerMaterials,
  characterLevel,
  onCraft,
  isCrafting,
}: {
  recipe: Recipe;
  playerMaterials: Map<string, number>;
  characterLevel: number;
  onCraft: () => void;
  isCrafting: boolean;
}) {
  const canCraft =
    characterLevel >= recipe.required_level &&
    recipe.materials?.every((rm) => {
      const playerQty = playerMaterials.get(rm.material_id) || 0;
      return playerQty >= rm.quantity_required;
    });

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{recipe.icon || recipe.result_item?.icon || "🔨"}</span>
            <div>
              <CardTitle className="text-lg">{recipe.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{recipe.description}</p>
            </div>
          </div>
          <Badge variant={characterLevel >= recipe.required_level ? "default" : "secondary"}>
            Nv. {recipe.required_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Result Item */}
        {recipe.result_item && (
          <div className={cn("p-3 rounded-lg border", rarityBg[recipe.result_item.rarity], rarityColors[recipe.result_item.rarity])}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Resultado: {recipe.result_item.name}</span>
              <Badge variant="outline" className={rarityColors[recipe.result_item.rarity]}>
                {recipe.result_item.rarity}
              </Badge>
            </div>
          </div>
        )}

        {/* Required Materials */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Package className="w-4 h-4" /> Materiais Necessários
          </h4>
          <div className="space-y-1">
            {recipe.materials?.map((rm) => {
              const playerQty = playerMaterials.get(rm.material_id) || 0;
              const hasEnough = playerQty >= rm.quantity_required;
              return (
                <div
                  key={rm.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm",
                    hasEnough ? "bg-green-500/10" : "bg-destructive/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {hasEnough ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-destructive" />
                    )}
                    <span>{rm.material?.icon}</span>
                    <span>{rm.material?.name}</span>
                  </div>
                  <span className={hasEnough ? "text-green-500" : "text-destructive"}>
                    {playerQty}/{rm.quantity_required}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Craft Button */}
        <Button
          className="w-full"
          onClick={onCraft}
          disabled={!canCraft || isCrafting}
        >
          {isCrafting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Hammer className="w-4 h-4 mr-2" />
          )}
          {canCraft ? "Criar Item" : "Materiais Insuficientes"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Crafting() {
  const { data: character } = useCharacter();
  const { data: materials, isLoading: materialsLoading } = useMaterials();
  const { data: playerMaterials, isLoading: playerMaterialsLoading } = usePlayerMaterials();
  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const craftItem = useCraftItem();

  const [craftingRecipeId, setCraftingRecipeId] = useState<string | null>(null);

  // Create a map of material quantities for easy lookup
  const materialQuantities = new Map(
    playerMaterials?.map((pm) => [pm.material_id, pm.quantity]) || []
  );

  const handleCraft = async (recipe: Recipe) => {
    setCraftingRecipeId(recipe.id);
    try {
      await craftItem.mutateAsync(recipe);
    } finally {
      setCraftingRecipeId(null);
    }
  };

  const isLoading = materialsLoading || playerMaterialsLoading || recipesLoading;

  return (
    <GameLayout>
      <div className="space-y-6">
        {/* Header */}
         <div className="flex items-center gap-4">
           <GameAvatar size="md" />
          <div>
            <h1 className="text-3xl font-display font-bold">Crafting</h1>
            <p className="text-muted-foreground">Combine materiais para criar itens poderosos</p>
          </div>
        </div>

        <Tabs defaultValue="mining">
          <TabsList className="w-full max-w-lg">
            <TabsTrigger value="mining" className="flex-1">
              <Pickaxe className="w-4 h-4 mr-1" />
              Mineração
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex-1">
              <Hammer className="w-4 h-4 mr-1" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex-1">
              <Package className="w-4 h-4 mr-1" />
              Materiais
              {playerMaterials && playerMaterials.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {playerMaterials.reduce((sum, pm) => sum + pm.quantity, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mining" className="mt-6">
            <MiningGame />
          </TabsContent>

          <TabsContent value="recipes" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recipes && recipes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    playerMaterials={materialQuantities}
                    characterLevel={character?.level || 1}
                    onCraft={() => handleCraft(recipe)}
                    isCrafting={craftingRecipeId === recipe.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Hammer className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma receita disponível ainda</p>
                  <p className="text-sm text-muted-foreground">Receitas serão adicionadas em breve!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : playerMaterials && playerMaterials.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {playerMaterials
                  .filter((pm) => pm.quantity > 0)
                  .map((pm) => (
                    <MaterialCard
                      key={pm.id}
                      material={pm.material!}
                      quantity={pm.quantity}
                    />
                  ))}
              </div>
            ) : (
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Você não possui materiais</p>
                  <p className="text-sm text-muted-foreground">
                    Complete missões, masmorras e arena para coletar materiais
                  </p>
                </CardContent>
              </Card>
            )}

            {/* All Materials Reference */}
            <div className="mt-8">
              <h2 className="text-xl font-display font-bold mb-4">Todos os Materiais</h2>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {materials?.map((material) => (
                  <div
                    key={material.id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border",
                      rarityBg[material.rarity],
                      rarityColors[material.rarity]
                    )}
                  >
                    <span className="text-xl">{material.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{material.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{material.drop_source}</p>
                    </div>
                    <Badge variant="outline" className={rarityColors[material.rarity]}>
                      {materialQuantities.get(material.id) || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </GameLayout>
  );
}
