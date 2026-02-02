import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pickaxe,
  Gem,
  Hammer,
  ShoppingCart,
  Wrench,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  usePickaxes,
  usePlayerPickaxes,
  useMiningNodes,
  useBuyPickaxe,
  useEquipPickaxe,
  useUpdateDurability,
  useRepairPickaxe,
  MiningNode,
  PlayerPickaxe,
  Pickaxe as PickaxeType,
} from "@/hooks/useMining";
import { useAddMaterial } from "@/hooks/useCrafting";
import { useCharacter } from "@/hooks/useCharacter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground border-muted",
  uncommon: "text-green-500 border-green-500/50",
  rare: "text-blue-500 border-blue-500/50",
  epic: "text-purple-500 border-purple-500/50",
  legendary: "text-amber-500 border-amber-500/50",
};

const tierColors: Record<number, string> = {
  1: "from-stone-600 to-stone-800",
  2: "from-zinc-500 to-zinc-700",
  3: "from-amber-600 to-amber-800",
  4: "from-cyan-500 to-cyan-700",
  5: "from-purple-600 to-purple-800",
};

interface MiningBlock {
  id: string;
  node: MiningNode;
  currentHp: number;
  x: number;
  y: number;
}

interface DropPopup {
  id: string;
  material: string;
  quantity: number;
  x: number;
  y: number;
}

export function MiningGame() {
  const { data: pickaxes, isLoading: pickaxesLoading } = usePickaxes();
  const { data: playerPickaxes, isLoading: playerPickaxesLoading } = usePlayerPickaxes();
  const { data: miningNodes, isLoading: nodesLoading } = useMiningNodes();
  const { data: character } = useCharacter();
  const buyPickaxe = useBuyPickaxe();
  const equipPickaxe = useEquipPickaxe();
  const updateDurability = useUpdateDurability();
  const repairPickaxe = useRepairPickaxe();
  const addMaterial = useAddMaterial();

  const [blocks, setBlocks] = useState<MiningBlock[]>([]);
  const [dropPopups, setDropPopups] = useState<DropPopup[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);

  const equippedPickaxe = playerPickaxes?.find((p) => p.is_equipped);

  // Generate mining blocks based on selected tier
  const generateBlocks = useCallback(() => {
    if (!miningNodes) return;

    const tierNodes = miningNodes.filter((n) => n.tier === selectedTier);
    if (tierNodes.length === 0) return;

    const newBlocks: MiningBlock[] = [];
    const gridSize = 4;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const randomNode = tierNodes[Math.floor(Math.random() * tierNodes.length)];
        newBlocks.push({
          id: `${x}-${y}-${Date.now()}`,
          node: randomNode,
          currentHp: randomNode.hp,
          x,
          y,
        });
      }
    }

    setBlocks(newBlocks);
  }, [miningNodes, selectedTier]);

  useEffect(() => {
    generateBlocks();
  }, [generateBlocks]);

  const handleMineBlock = async (block: MiningBlock) => {
    if (!equippedPickaxe || !equippedPickaxe.pickaxe) {
      toast.error("Equipe uma picareta primeiro!");
      return;
    }

    if (equippedPickaxe.current_durability <= 0) {
      toast.error("Sua picareta está quebrada!");
      return;
    }

    if (equippedPickaxe.pickaxe.mining_power < block.node.required_mining_power) {
      toast.error(`Poder de mineração insuficiente! Necessário: ${block.node.required_mining_power}`);
      return;
    }

    const damage = equippedPickaxe.pickaxe.mining_power;
    const newHp = block.currentHp - damage;

    // Update block HP
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, currentHp: Math.max(0, newHp) } : b
      )
    );

    // Reduce pickaxe durability
    await updateDurability.mutateAsync({
      playerPickaxeId: equippedPickaxe.id,
      newDurability: equippedPickaxe.current_durability - 1,
    });

    // Block destroyed
    if (newHp <= 0) {
      // Add drop popup
      const dropId = `drop-${Date.now()}`;
      setDropPopups((prev) => [
        ...prev,
        {
          id: dropId,
          material: block.node.icon,
          quantity: 1,
          x: block.x,
          y: block.y,
        },
      ]);

      // Remove popup after animation
      setTimeout(() => {
        setDropPopups((prev) => prev.filter((d) => d.id !== dropId));
      }, 1000);

      // Respawn new block after delay
      setTimeout(() => {
        if (!miningNodes) return;
        const tierNodes = miningNodes.filter((n) => n.tier === selectedTier);
        if (tierNodes.length === 0) return;

        const randomNode = tierNodes[Math.floor(Math.random() * tierNodes.length)];
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id
              ? {
                  id: `${block.x}-${block.y}-${Date.now()}`,
                  node: randomNode,
                  currentHp: randomNode.hp,
                  x: block.x,
                  y: block.y,
                }
              : b
          )
        );
      }, 500);
    }
  };

  const handleBuyPickaxe = async (pickaxe: PickaxeType) => {
    await buyPickaxe.mutateAsync(pickaxe);
    setShowShop(false);
  };

  const handleEquipPickaxe = async (playerPickaxe: PlayerPickaxe) => {
    await equipPickaxe.mutateAsync(playerPickaxe.id);
  };

  const handleRepair = async (playerPickaxe: PlayerPickaxe) => {
    const cost = 25;
    const repairAmount = 50;
    await repairPickaxe.mutateAsync({ playerPickaxe, repairAmount, cost });
  };

  const isLoading = pickaxesLoading || playerPickaxesLoading || nodesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with equipped pickaxe */}
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {equippedPickaxe ? (
                <>
                  <div className="text-4xl">{equippedPickaxe.pickaxe?.icon}</div>
                  <div>
                    <h3 className={cn("font-bold", rarityColors[equippedPickaxe.pickaxe?.rarity || "common"])}>
                      {equippedPickaxe.pickaxe?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Durabilidade:</span>
                      <Progress
                        value={(equippedPickaxe.current_durability / (equippedPickaxe.pickaxe?.max_durability || 100)) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-xs">
                        {equippedPickaxe.current_durability}/{equippedPickaxe.pickaxe?.max_durability}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Gem className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Poder: {equippedPickaxe.pickaxe?.mining_power}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Nenhuma picareta equipada</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {equippedPickaxe && equippedPickaxe.current_durability < (equippedPickaxe.pickaxe?.max_durability || 100) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRepair(equippedPickaxe)}
                  disabled={repairPickaxe.isPending}
                >
                  <Wrench className="w-4 h-4 mr-1" />
                  Reparar (25g)
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowInventory(true)}>
                <Pickaxe className="w-4 h-4 mr-1" />
                Picaretas
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowShop(true)}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Loja
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Selection */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((tier) => (
          <Button
            key={tier}
            variant={selectedTier === tier ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTier(tier)}
            disabled={!equippedPickaxe || (equippedPickaxe.pickaxe?.mining_power || 0) < tier}
          >
            Tier {tier}
          </Button>
        ))}
      </div>

      {/* Mining Grid */}
      <Card className="bg-card/50 backdrop-blur border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2 relative">
            {blocks.map((block) => (
              <motion.button
                key={block.id}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center relative overflow-hidden",
                  "bg-gradient-to-br border-2 border-primary/30",
                  "hover:scale-105 hover:border-primary transition-all",
                  "active:scale-95",
                  tierColors[block.node.tier]
                )}
                onClick={() => handleMineBlock(block)}
                whileTap={{ scale: 0.9 }}
                disabled={!equippedPickaxe || equippedPickaxe.current_durability <= 0}
              >
                <span className="text-3xl md:text-4xl">{block.node.icon}</span>
                <Progress
                  value={(block.currentHp / block.node.hp) * 100}
                  className="absolute bottom-1 left-1 right-1 h-1.5"
                />
                {block.currentHp < block.node.hp && (
                  <motion.div
                    className="absolute inset-0 bg-destructive/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            ))}

            {/* Drop Popups */}
            <AnimatePresence>
              {dropPopups.map((drop) => (
                <motion.div
                  key={drop.id}
                  className="absolute pointer-events-none flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded-lg text-sm font-bold z-10"
                  style={{
                    left: `${drop.x * 25 + 12.5}%`,
                    top: `${drop.y * 25 + 12.5}%`,
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -30, scale: 1 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-3 h-3" />
                  +{drop.quantity} {drop.material}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Pickaxe Shop Dialog */}
      <Dialog open={showShop} onOpenChange={setShowShop}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Loja de Picaretas
            </DialogTitle>
            <DialogDescription>
              Seu ouro: {character?.gold || 0}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {pickaxes
              ?.filter((p) => p.price !== null)
              .map((pickaxe) => (
                <div
                  key={pickaxe.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
                >
                  <span className="text-3xl">{pickaxe.icon}</span>
                  <div className="flex-1">
                    <h4 className={cn("font-medium", rarityColors[pickaxe.rarity])}>
                      {pickaxe.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{pickaxe.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Durabilidade: {pickaxe.max_durability}</span>
                      <span>Poder: {pickaxe.mining_power}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyPickaxe(pickaxe)}
                    disabled={buyPickaxe.isPending || (character?.gold || 0) < (pickaxe.price || 0)}
                  >
                    {pickaxe.price}g
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pickaxe Inventory Dialog */}
      <Dialog open={showInventory} onOpenChange={setShowInventory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pickaxe className="w-5 h-5" />
              Suas Picaretas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {playerPickaxes && playerPickaxes.length > 0 ? (
              playerPickaxes.map((pp) => (
                <div
                  key={pp.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    pp.is_equipped ? "border-primary bg-primary/10" : "bg-card/50"
                  )}
                >
                  <span className="text-3xl">{pp.pickaxe?.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("font-medium", rarityColors[pp.pickaxe?.rarity || "common"])}>
                        {pp.pickaxe?.name}
                      </h4>
                      {pp.is_equipped && (
                        <Badge variant="default" className="text-xs">
                          Equipada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={(pp.current_durability / (pp.pickaxe?.max_durability || 100)) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-xs">
                        {pp.current_durability}/{pp.pickaxe?.max_durability}
                      </span>
                    </div>
                  </div>
                  {!pp.is_equipped && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEquipPickaxe(pp)}
                      disabled={equipPickaxe.isPending}
                    >
                      Equipar
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pickaxe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Você não possui picaretas</p>
                <p className="text-sm">Compre uma na loja!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShop(true)}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              Ir para Loja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
