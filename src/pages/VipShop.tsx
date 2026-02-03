import { GameLayout } from "@/components/layout/GameLayout";
import { useVipClothingCatalog, useMyVipClothing, useBuyVipClothing, useEquipVipClothing, VipClothing } from "@/hooks/useVipClothing";
import { useCharacter } from "@/hooks/useCharacter";
import { Loader2, Crown, Shirt, Scissors, Check, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const rarityColors: Record<string, string> = {
  vip: "bg-primary/20 text-primary border-primary",
  legendary: "bg-gold/20 text-gold border-gold",
  mythic: "bg-accent/20 text-accent border-accent",
};

const typeIcons: Record<string, typeof Shirt> = {
  shirt: Shirt,
  pants: Shirt,
  hair: Scissors,
  accessory: Sparkles,
};

const typeLabels: Record<string, string> = {
  shirt: "Camisas",
  pants: "Calças",
  hair: "Cabelos",
  accessory: "Acessórios",
};

function ClothingCard({ 
  item, 
  owned, 
  equipped,
  onBuy, 
  onEquip,
  isBuying,
  canAfford,
  playerLevel
}: { 
  item: VipClothing;
  owned: boolean;
  equipped: boolean;
  onBuy: () => void;
  onEquip: () => void;
  isBuying: boolean;
  canAfford: boolean;
  playerLevel: number;
}) {
  const Icon = typeIcons[item.type] || Shirt;
  const meetsLevel = playerLevel >= item.min_level;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:scale-[1.02]",
      equipped && "ring-2 ring-primary",
      !meetsLevel && "opacity-60"
    )}>
      {equipped && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Check className="w-3 h-3" />
            Equipado
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            rarityColors[item.rarity]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <Badge variant="outline" className={cn("text-xs", rarityColors[item.rarity])}>
              {item.rarity.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{item.description}</p>
        
        {item.image_url && (
          <div className="aspect-square max-h-24 bg-secondary/50 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Nível mín:</span>
          <span className={cn(
            "font-medium",
            meetsLevel ? "text-primary" : "text-destructive"
          )}>
            {item.min_level}
          </span>
        </div>
        
        {owned ? (
          <Button 
            onClick={onEquip} 
            variant={equipped ? "outline" : "default"}
            className="w-full"
            disabled={equipped}
          >
            {equipped ? "Equipado" : "Equipar"}
          </Button>
        ) : (
          <Button 
            onClick={onBuy} 
            disabled={isBuying || !canAfford || !meetsLevel}
            className="w-full gap-2"
          >
            {isBuying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span className={cn(!canAfford && "text-destructive")}>
                {item.price_gold.toLocaleString()} Gold
              </span>
            </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VipShop() {
  const { data: catalog, isLoading: catalogLoading } = useVipClothingCatalog();
  const { data: myClothing, isLoading: myClothingLoading } = useMyVipClothing();
  const { data: character, isLoading: charLoading } = useCharacter();
  const buyClothing = useBuyVipClothing();
  const equipClothing = useEquipVipClothing();

  const isLoading = catalogLoading || myClothingLoading || charLoading;

  if (isLoading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const ownedIds = new Set(myClothing?.map(c => c.clothing_id) || []);
  const equippedIds = new Set([
    character?.vip_shirt_id,
    character?.vip_pants_id,
    character?.vip_hair_id,
  ].filter(Boolean));

  const groupedCatalog = {
    shirt: catalog?.filter(c => c.type === "shirt") || [],
    pants: catalog?.filter(c => c.type === "pants") || [],
    hair: catalog?.filter(c => c.type === "hair") || [],
    accessory: catalog?.filter(c => c.type === "accessory") || [],
  };

  const handleBuy = (clothingId: string) => {
    buyClothing.mutate(clothingId);
  };

  const handleEquip = (clothingId: string, type: string) => {
    equipClothing.mutate({ 
      clothingId, 
      type: type as "shirt" | "pants" | "hair" 
    });
  };

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-gold" />
            <div>
              <h1 className="font-display text-2xl font-bold">Loja VIP</h1>
              <p className="text-muted-foreground text-sm">Roupas exclusivas e personalizadas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
            <span className="text-gold font-bold">{character?.gold?.toLocaleString() || 0}</span>
            <span className="text-muted-foreground text-sm">Gold</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="shirt" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            {Object.entries(typeLabels).map(([type, label]) => (
              <TabsTrigger key={type} value={type} className="gap-2">
                {type === "shirt" && <Shirt className="w-4 h-4" />}
                {type === "pants" && <Shirt className="w-4 h-4" />}
                {type === "hair" && <Scissors className="w-4 h-4" />}
                {type === "accessory" && <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedCatalog).map(([type, items]) => (
            <TabsContent key={type} value={type}>
              {items.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum item disponível nesta categoria</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      owned={ownedIds.has(item.id)}
                      equipped={equippedIds.has(item.id)}
                      onBuy={() => handleBuy(item.id)}
                      onEquip={() => handleEquip(item.id, item.type)}
                      isBuying={buyClothing.isPending}
                      canAfford={(character?.gold || 0) >= item.price_gold}
                      playerLevel={character?.level || 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Owned Items Section */}
        {myClothing && myClothing.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Meus Itens VIP
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {myClothing.map((item) => {
                const isEquipped = equippedIds.has(item.clothing_id);
                return (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:border-primary",
                      isEquipped && "ring-2 ring-primary"
                    )}
                    onClick={() => item.clothing && handleEquip(item.clothing_id, item.clothing.type)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={cn("shrink-0", rarityColors[item.clothing?.rarity || 'vip'])}>
                        {item.clothing?.rarity?.[0].toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium truncate">{item.clothing?.name}</span>
                      {isEquipped && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
