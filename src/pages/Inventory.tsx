import { useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import { 
  useInventory, 
  useEquipItem, 
  useUnequipItem, 
  useUsePotion,
  InventoryItem 
} from "@/hooks/useInventory";
import { useCharacter } from "@/hooks/useCharacter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Sword, 
  Shield, 
  Crown, 
  Footprints,
  Gem,
  FlaskRound,
  CheckCircle,
  Package,
  Sparkles
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
  all: "Todos",
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

function InventoryItemCard({ inventoryItem }: { inventoryItem: InventoryItem }) {
  const equipItem = useEquipItem();
  const unequipItem = useUnequipItem();
  const usePotion = useUsePotion();
  const { item } = inventoryItem;

  const Icon = typeIcons[item.type] || Package;
  const isEquipped = inventoryItem.is_equipped;
  const isPotion = item.is_consumable;

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

  const handleAction = () => {
    if (isPotion) {
      usePotion.mutate(inventoryItem);
    } else if (isEquipped) {
      unequipItem.mutate(inventoryItem);
    } else {
      equipItem.mutate(inventoryItem);
    }
  };

  const isPending = equipItem.isPending || unequipItem.isPending || usePotion.isPending;

  return (
    <div 
      className={cn(
        "border rounded-xl p-4 transition-all relative",
        rarityColors[item.rarity],
        rarityBg[item.rarity],
        isEquipped && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
          <CheckCircle className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-3 rounded-lg relative",
          rarityBg[item.rarity]
        )}>
          <Icon className={cn("w-6 h-6", rarityColors[item.rarity].split(" ")[0])} />
          {inventoryItem.quantity > 1 && (
            <Badge 
              className="absolute -bottom-2 -right-2 h-5 min-w-5 flex items-center justify-center text-xs"
            >
              {inventoryItem.quantity}
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-display font-bold", rarityColors[item.rarity].split(" ")[0])}>
            {item.name}
          </h3>
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
      
      <div className="mt-4 pt-3 border-t border-border/50">
        <Button
          size="sm"
          variant={isEquipped ? "outline" : "default"}
          onClick={handleAction}
          disabled={isPending}
          className="w-full gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPotion ? (
            <>
              <FlaskRound className="w-4 h-4" />
              Usar
            </>
          ) : isEquipped ? (
            "Desequipar"
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Equipar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { data: inventory, isLoading: invLoading } = useInventory();
  const { data: character, isLoading: charLoading } = useCharacter();
  const [activeTab, setActiveTab] = useState("all");

  if (invLoading || charLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const equippedItems = inventory?.filter((i) => i.is_equipped) || [];
  
  const filteredInventory = activeTab === "all" 
    ? inventory 
    : inventory?.filter((i) => i.item.type === activeTab);

  // Calculate total bonuses from equipped items
  const totalBonuses = equippedItems.reduce((acc, inv) => {
    return {
      strength: acc.strength + inv.item.strength_bonus,
      defense: acc.defense + inv.item.defense_bonus,
      vitality: acc.vitality + inv.item.vitality_bonus,
      agility: acc.agility + inv.item.agility_bonus,
      luck: acc.luck + inv.item.luck_bonus,
      mana: acc.mana + inv.item.mana_bonus,
    };
  }, { strength: 0, defense: 0, vitality: 0, agility: 0, luck: 0, mana: 0 });

  const types = ["all", "weapon", "armor", "helmet", "boots", "accessory", "potion"];

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Inventário
          </h1>
          <p className="text-muted-foreground">Gerencie seus equipamentos e itens</p>
        </div>

        {/* Equipped Summary */}
        {equippedItems.length > 0 && (
          <div className="bg-card border border-primary/30 rounded-xl p-4">
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Bônus de Equipamentos
            </h2>
            <div className="flex flex-wrap gap-3">
              {totalBonuses.strength > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Sword className="w-3 h-3" /> +{totalBonuses.strength} Força
                </Badge>
              )}
              {totalBonuses.defense > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Shield className="w-3 h-3" /> +{totalBonuses.defense} Defesa
                </Badge>
              )}
              {totalBonuses.vitality > 0 && (
                <Badge variant="outline" className="gap-1">
                  +{totalBonuses.vitality} Vitalidade
                </Badge>
              )}
              {totalBonuses.agility > 0 && (
                <Badge variant="outline" className="gap-1">
                  +{totalBonuses.agility} Agilidade
                </Badge>
              )}
              {totalBonuses.luck > 0 && (
                <Badge variant="outline" className="gap-1">
                  +{totalBonuses.luck} Sorte
                </Badge>
              )}
              {totalBonuses.mana > 0 && (
                <Badge variant="outline" className="gap-1">
                  +{totalBonuses.mana} Mana
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {types.map((type) => {
              const Icon = type === "all" ? Package : typeIcons[type];
              const count = type === "all" 
                ? inventory?.length || 0 
                : inventory?.filter((i) => i.item.type === type).length || 0;
              
              return (
                <TabsTrigger key={type} value={type} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{typeLabels[type]}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {types.map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              {filteredInventory && filteredInventory.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredInventory.map((invItem) => (
                    <InventoryItemCard key={invItem.id} inventoryItem={invItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {type === "all" 
                      ? "Seu inventário está vazio. Visite a loja para comprar itens!"
                      : `Nenhum item desta categoria.`}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </GameLayout>
  );
}
