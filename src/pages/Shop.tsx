import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { useShopItems, useBuyItem, Item } from "@/hooks/useInventory";
import { useCharacter } from "@/hooks/useCharacter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Coins, 
  Sword, 
  Shield, 
  Crown, 
  Footprints,
  Gem,
  FlaskRound,
  Wand2,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ElementType> = {
  weapon: Sword,
  armor: Shield,
  helmet: Crown,
  boots: Footprints,
  accessory: Gem,
  potion: FlaskRound,
};

const typeLabels: Record<string, string> = {
  weapon: "Armas",
  armor: "Armaduras",
  helmet: "Elmos",
  boots: "Botas",
  accessory: "Acessórios",
  potion: "Poções",
};

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground border-muted",
  uncommon: "text-green-400 border-green-400/50",
  rare: "text-blue-400 border-blue-400/50",
  epic: "text-purple-400 border-purple-400/50",
  legendary: "text-gold border-gold/50",
};

const rarityBg: Record<string, string> = {
  common: "bg-muted/20",
  uncommon: "bg-green-400/10",
  rare: "bg-blue-400/10",
  epic: "bg-purple-400/10",
  legendary: "bg-gold/10",
};

function ItemCard({ item, characterLevel, gold }: { item: Item; characterLevel: number; gold: number }) {
  const buyItem = useBuyItem();
  const canAfford = gold >= item.price;
  const meetsLevel = characterLevel >= item.min_level;
  const canBuy = canAfford && meetsLevel;

  const Icon = typeIcons[item.type] || Sword;

  const bonuses = [
    item.strength_bonus > 0 && `+${item.strength_bonus} Força`,
    item.defense_bonus > 0 && `+${item.defense_bonus} Defesa`,
    item.vitality_bonus > 0 && `+${item.vitality_bonus} Vitalidade`,
    item.agility_bonus > 0 && `+${item.agility_bonus} Agilidade`,
    item.luck_bonus > 0 && `+${item.luck_bonus} Sorte`,
    item.mana_bonus > 0 && `+${item.mana_bonus} Mana`,
    item.hp_restore > 0 && `+${item.hp_restore} Vida`,
    item.energy_restore > 0 && `+${item.energy_restore} Energia`,
    item.mana_restore > 0 && `+${item.mana_restore} Mana`,
  ].filter(Boolean);

  return (
    <div 
      className={cn(
        "border rounded-xl p-4 transition-all hover:scale-[1.02]",
        rarityColors[item.rarity],
        rarityBg[item.rarity]
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-3 rounded-lg",
          rarityBg[item.rarity]
        )}>
          <Icon className={cn("w-6 h-6", rarityColors[item.rarity].split(" ")[0])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn("font-display font-bold", rarityColors[item.rarity].split(" ")[0])}>
              {item.name}
            </h3>
            {item.min_level > 1 && (
              <Badge variant="outline" className="text-xs">
                Nv. {item.min_level}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
          {bonuses.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bonuses.map((bonus, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {bonus}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-gold" />
          <span className={cn("font-bold", canAfford ? "text-gold" : "text-destructive")}>
            {item.price}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => buyItem.mutate({ item })}
          disabled={!canBuy || buyItem.isPending}
          className="gap-2"
        >
          {buyItem.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          {!meetsLevel ? `Nv. ${item.min_level}` : "Comprar"}
        </Button>
      </div>
    </div>
  );
}

export default function Shop() {
  const { data: items, isLoading: itemsLoading } = useShopItems();
  const { data: character, isLoading: charLoading } = useCharacter();
  const [activeTab, setActiveTab] = useState("weapon");

  if (itemsLoading || charLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const itemsByType = items?.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Item[]>) || {};

  const types = Object.keys(typeLabels);

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Loja</h1>
            <p className="text-muted-foreground">Compre equipamentos e poções</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-gold/30 rounded-lg px-4 py-2">
            <Coins className="w-5 h-5 text-gold" />
            <span className="font-bold text-gold">{character.gold}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            {types.map((type) => {
              const Icon = typeIcons[type];
              return (
                <TabsTrigger key={type} value={type} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{typeLabels[type]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {types.map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itemsByType[type]?.map((item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    characterLevel={character.level}
                    gold={character.gold}
                  />
                ))}
              </div>
              {(!itemsByType[type] || itemsByType[type].length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum item disponível nesta categoria.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </GameLayout>
  );
}
