import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
  ShoppingCart,
  Wrench,
  AlertTriangle,
  Sparkles,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  usePickaxes,
  usePlayerPickaxes,
  useMiningNodes,
  useMiningDrops,
  useBuyPickaxe,
  useEquipPickaxe,
  useUpdateDurability,
  useRepairPickaxe,
  useAddMinedMaterial,
  MiningNode,
  PlayerPickaxe,
  Pickaxe as PickaxeType,
} from "@/hooks/useMining";
import { useCharacter } from "@/hooks/useCharacter";
import { AvatarFace } from "@/components/game/AvatarFace";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground border-muted",
  uncommon: "text-green-500 border-green-500/50",
  rare: "text-blue-500 border-blue-500/50",
  epic: "text-purple-500 border-purple-500/50",
  legendary: "text-amber-500 border-amber-500/50",
};

// Block visual styles per tier - simple solid colors
const blockStyles: Record<number, { color: string; name: string; icon: string }> = {
  1: { color: "bg-stone-500", name: "Pedra/Cobre", icon: "🪨" },
  2: { color: "bg-slate-400", name: "Prata/Ferro", icon: "⬛" },
  3: { color: "bg-yellow-500", name: "Ouro/Cristal", icon: "🟡" },
  4: { color: "bg-cyan-400", name: "Diamante", icon: "💎" },
  5: { color: "bg-purple-500", name: "Sombrio/Elemental", icon: "🔮" },
};

interface Block {
  id: string;
  x: number;
  y: number;
  node: MiningNode | null;
  currentHp: number;
  isMined: boolean;
}

interface DropPopup {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  x: number;
  y: number;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 8;
const CELL_SIZE = 48;

export function MiningGame() {
  const { data: pickaxes, isLoading: pickaxesLoading } = usePickaxes();
  const { data: playerPickaxes, isLoading: playerPickaxesLoading } = usePlayerPickaxes();
  const { data: miningNodes, isLoading: nodesLoading } = useMiningNodes();
  const { data: miningDrops } = useMiningDrops();
  const { data: character } = useCharacter();
  const buyPickaxe = useBuyPickaxe();
  const equipPickaxe = useEquipPickaxe();
  const updateDurability = useUpdateDurability();
  const repairPickaxe = useRepairPickaxe();
  const addMinedMaterial = useAddMinedMaterial();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 4, y: 0 });
  const [dropPopups, setDropPopups] = useState<DropPopup[]>([]);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isMining, setIsMining] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const gameRef = useRef<HTMLDivElement>(null);
  const gravityRef = useRef<NodeJS.Timeout | null>(null);

  const equippedPickaxe = playerPickaxes?.find((p) => p.is_equipped);

  // Generate floor blocks
  const generateFloor = useCallback((floor: number) => {
    if (!miningNodes) return;

    const tier = Math.min(Math.ceil(floor / 2), 5);
    const tierNodes = miningNodes.filter((n) => n.tier <= tier);
    if (tierNodes.length === 0) return;

    const newBlocks: Block[] = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        // Top row is always empty (spawn area)
        if (y === 0) {
          newBlocks.push({
            id: `${x}-${y}`,
            x,
            y,
            node: null,
            currentHp: 0,
            isMined: true,
          });
        } else {
          // Random chance for empty spaces
          const isEmpty = Math.random() < 0.1;
          if (isEmpty) {
            newBlocks.push({
              id: `${x}-${y}`,
              x,
              y,
              node: null,
              currentHp: 0,
              isMined: true,
            });
          } else {
            // Weight toward lower tier nodes
            const weightedNodes = tierNodes.filter(() => Math.random() < 0.7 || tierNodes.length === 1);
            const nodePool = weightedNodes.length > 0 ? weightedNodes : tierNodes;
            const randomNode = nodePool[Math.floor(Math.random() * nodePool.length)];
            newBlocks.push({
              id: `${x}-${y}`,
              x,
              y,
              node: randomNode,
              currentHp: randomNode.hp,
              isMined: false,
            });
          }
        }
      }
    }

    setBlocks(newBlocks);
    setPlayerPos({ x: 4, y: 0 });
  }, [miningNodes]);

  useEffect(() => {
    generateFloor(currentFloor);
  }, [generateFloor, currentFloor]);

  // Helper: check if a position has solid ground below or is on solid ground
  const hasGroundBelow = useCallback((x: number, y: number) => {
    if (y >= GRID_HEIGHT - 1) return true; // Bottom of grid is ground
    const blockBelow = blocks.find((b) => b.x === x && b.y === y + 1);
    return blockBelow && !blockBelow.isMined;
  }, [blocks]);

  // Helper: check if position is empty/mined
  const isEmptyAt = useCallback((x: number, y: number) => {
    const block = blocks.find((b) => b.x === x && b.y === y);
    return block?.isMined ?? false;
  }, [blocks]);

  // Gravity system - player falls if no ground below (slower gravity)
  useEffect(() => {
    if (gravityRef.current) {
      clearInterval(gravityRef.current);
    }

    gravityRef.current = setInterval(() => {
      setPlayerPos((prev) => {
        // Check if there's solid ground below
        if (!hasGroundBelow(prev.x, prev.y)) {
          const newY = prev.y + 1;
          if (newY < GRID_HEIGHT && isEmptyAt(prev.x, newY)) {
            return { ...prev, y: newY };
          }
        }
        return prev;
      });
    }, 350); // Slower fall speed (was 150ms, now 350ms)

    return () => {
      if (gravityRef.current) {
        clearInterval(gravityRef.current);
      }
    };
  }, [hasGroundBelow, isEmptyAt]);

  // Helper: check if can jump/climb to target position
  const canJumpTo = useCallback((targetY: number) => {
    const currentY = playerPos.y;
    const jumpHeight = currentY - targetY;
    
    // Can jump up to 2 blocks normally
    if (jumpHeight > 2 || jumpHeight < 1) return false;
    
    // Check all blocks between current and target are empty
    for (let y = currentY - 1; y >= targetY; y--) {
      if (!isEmptyAt(playerPos.x, y)) return false;
    }
    
    // Must have ground to jump from
    return hasGroundBelow(playerPos.x, currentY);
  }, [playerPos, isEmptyAt, hasGroundBelow]);

  // Helper: check if can climb (wall climb for 3 blocks)
  const canClimbTo = useCallback((targetY: number, direction: "left" | "right") => {
    const currentY = playerPos.y;
    const climbHeight = currentY - targetY;
    
    // Climbing allows going up to 3 blocks
    if (climbHeight > 3 || climbHeight < 1) return false;
    
    // Check if there's a wall to climb on the side
    const wallX = direction === "left" ? playerPos.x - 1 : playerPos.x + 1;
    if (wallX < 0 || wallX >= GRID_WIDTH) return false;
    
    // Need at least one solid block on the wall side to climb
    let hasWall = false;
    for (let y = currentY; y >= targetY; y--) {
      const wallBlock = blocks.find((b) => b.x === wallX && b.y === y);
      if (wallBlock && !wallBlock.isMined) {
        hasWall = true;
        break;
      }
    }
    if (!hasWall) return false;
    
    // Check all blocks in climb path are empty
    for (let y = currentY - 1; y >= targetY; y--) {
      if (!isEmptyAt(playerPos.x, y)) return false;
    }
    
    return true;
  }, [playerPos, blocks, isEmptyAt]);

  // Keyboard controls with jump and climb physics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMining) return;

      let newX = playerPos.x;
      let newY = playerPos.y;
      let moved = false;

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
        case " ": // Space for jump
          // Try to jump 1 or 2 blocks up first
          if (canJumpTo(playerPos.y - 1)) {
            newY = playerPos.y - 1;
            moved = true;
          } else if (canJumpTo(playerPos.y - 2)) {
            newY = playerPos.y - 2;
            moved = true;
          } 
          // Try to climb up to 3 blocks if there's a wall nearby
          else if (canClimbTo(playerPos.y - 1, "left") || canClimbTo(playerPos.y - 1, "right")) {
            newY = playerPos.y - 1;
            moved = true;
          } else if (canClimbTo(playerPos.y - 2, "left") || canClimbTo(playerPos.y - 2, "right")) {
            newY = playerPos.y - 2;
            moved = true;
          } else if (canClimbTo(playerPos.y - 3, "left") || canClimbTo(playerPos.y - 3, "right")) {
            newY = playerPos.y - 3;
            moved = true;
          }
          break;
        case "s":
        case "arrowdown":
          // Only move down if there's empty space
          if (playerPos.y < GRID_HEIGHT - 1 && isEmptyAt(playerPos.x, playerPos.y + 1)) {
            newY = playerPos.y + 1;
            moved = true;
          }
          break;
        case "a":
        case "arrowleft":
          setFacingRight(false);
          if (playerPos.x > 0 && isEmptyAt(playerPos.x - 1, playerPos.y)) {
            newX = playerPos.x - 1;
            moved = true;
          }
          break;
        case "d":
        case "arrowright":
          setFacingRight(true);
          if (playerPos.x < GRID_WIDTH - 1 && isEmptyAt(playerPos.x + 1, playerPos.y)) {
            newX = playerPos.x + 1;
            moved = true;
          }
          break;
        default:
          return;
      }

      if (moved) {
        setPlayerPos({ x: newX, y: newY });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, blocks, isMining, canJumpTo, canClimbTo, isEmptyAt]);

  // Check if block is adjacent to player
  const isAdjacent = (x: number, y: number) => {
    const dx = Math.abs(x - playerPos.x);
    const dy = Math.abs(y - playerPos.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Mine a block
  const handleMineBlock = async (block: Block) => {
    if (!equippedPickaxe || !equippedPickaxe.pickaxe) {
      toast.error("Equipe uma picareta primeiro!");
      return;
    }

    if (equippedPickaxe.current_durability <= 0) {
      toast.error("Sua picareta está quebrada!");
      return;
    }

    if (!block.node || block.isMined) return;

    if (!isAdjacent(block.x, block.y)) {
      toast.error("Muito longe! Mova-se para perto do bloco.");
      return;
    }

    if (equippedPickaxe.pickaxe.mining_power < block.node.required_mining_power) {
      toast.error(`Poder insuficiente! Precisa: ${block.node.required_mining_power}`);
      return;
    }

    setIsMining(true);

    const damage = equippedPickaxe.pickaxe.mining_power;
    const newHp = block.currentHp - damage;

    // Update block
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, currentHp: Math.max(0, newHp) } : b
      )
    );

    // Reduce durability
    await updateDurability.mutateAsync({
      playerPickaxeId: equippedPickaxe.id,
      newDurability: equippedPickaxe.current_durability - 1,
    });

    // Block destroyed
    if (newHp <= 0) {
      // Find the drop for this node
      const nodeDrop = miningDrops?.find(d => d.node_id === block.node!.id);
      
      if (nodeDrop && nodeDrop.material) {
        // Calculate random quantity
        const quantity = Math.floor(
          Math.random() * (nodeDrop.max_quantity - nodeDrop.min_quantity + 1)
        ) + nodeDrop.min_quantity;

        // Add to player inventory
        await addMinedMaterial.mutateAsync({
          materialId: nodeDrop.material_id,
          quantity,
        });

        // Show drop popup
        const dropId = `drop-${Date.now()}`;
        setDropPopups((prev) => [
          ...prev,
          { 
            id: dropId, 
            name: nodeDrop.material.name,
            icon: nodeDrop.material.icon, 
            quantity,
            x: block.x, 
            y: block.y 
          },
        ]);

        setTimeout(() => {
          setDropPopups((prev) => prev.filter((d) => d.id !== dropId));
        }, 1200);
      }

      // Mark as mined
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, isMined: true, node: null } : b
        )
      );

      // Move player to the mined block
      setTimeout(() => {
        setPlayerPos({ x: block.x, y: block.y });
      }, 100);
    }

    setIsMining(false);
  };

  // Check if can go to next floor
  const canAdvanceFloor = blocks.filter((b) => b.y === GRID_HEIGHT - 1 && b.isMined).length > 0 &&
    playerPos.y === GRID_HEIGHT - 1;

  const handleNextFloor = () => {
    setCurrentFloor((f) => f + 1);
    toast.success(`Descendo para o andar ${currentFloor + 1}!`);
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
    <div className="space-y-4">
      {/* Header HUD */}
      <Card className="bg-card/80 backdrop-blur border-primary/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              {equippedPickaxe ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{equippedPickaxe.pickaxe?.icon}</span>
                  <div>
                    <p className={cn("text-sm font-bold", rarityColors[equippedPickaxe.pickaxe?.rarity || "common"])}>
                      {equippedPickaxe.pickaxe?.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(equippedPickaxe.current_durability / (equippedPickaxe.pickaxe?.max_durability || 100)) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {equippedPickaxe.current_durability}/{equippedPickaxe.pickaxe?.max_durability}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Sem picareta!</span>
                </div>
              )}

              <Badge variant="outline" className="border-primary/50">
                <Layers className="w-3 h-3 mr-1" />
                Andar {currentFloor}
              </Badge>
            </div>

            <div className="flex gap-2">
              {equippedPickaxe && equippedPickaxe.current_durability < (equippedPickaxe.pickaxe?.max_durability || 100) && (
                <Button size="sm" variant="outline" onClick={() => handleRepair(equippedPickaxe)}>
                  <Wrench className="w-3 h-3 mr-1" />
                  25g
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setShowInventory(true)}>
                <Pickaxe className="w-3 h-3 mr-1" />
                Picaretas
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowShop(true)}>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Loja
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mining Grid */}
      <div
        ref={gameRef}
        className="relative bg-gradient-to-b from-stone-900 to-stone-950 rounded-lg border-2 border-primary/30 overflow-hidden mx-auto"
        style={{ width: GRID_WIDTH * CELL_SIZE, height: GRID_HEIGHT * CELL_SIZE }}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)",
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
        />

        {/* Blocks */}
        {blocks.map((block) => {
          const style = blockStyles[block.node?.tier || 1];
          return (
            <motion.button
              key={block.id}
              className={cn(
                "absolute flex items-center justify-center transition-all overflow-hidden rounded-sm",
                block.isMined
                  ? "bg-transparent"
                  : cn(
                      style.color,
                      "border border-black/30",
                      isAdjacent(block.x, block.y) && "ring-2 ring-primary ring-offset-1 ring-offset-background cursor-pointer hover:brightness-125"
                    )
              )}
              style={{
                left: block.x * CELL_SIZE,
                top: block.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
              onClick={() => handleMineBlock(block)}
              disabled={block.isMined || !isAdjacent(block.x, block.y) || isMining}
              whileTap={!block.isMined && isAdjacent(block.x, block.y) ? { scale: 0.9 } : {}}
            >
              {!block.isMined && block.node && (
                <>
                  {/* HP bar when damaged */}
                  {block.currentHp < block.node.hp && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(block.currentHp / block.node.hp) * 100}%` }}
                      />
                    </div>
                  )}
                  {/* Crack overlay when damaged */}
                  {block.currentHp < block.node.hp * 0.5 && (
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                  )}
                </>
              )}
            </motion.button>
          );
        })}

        {/* Player Character */}
        <motion.div
          className="absolute z-10 flex flex-col items-center justify-end pointer-events-none"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
          animate={{
            left: playerPos.x * CELL_SIZE,
            top: playerPos.y * CELL_SIZE,
            scaleX: facingRight ? 1 : -1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Avatar Face */}
          <div className="relative">
            <AvatarFace
              hairStyle={character?.hair_style || "short"}
              hairColor={character?.hair_color || "#4a3728"}
              eyeColor={character?.eye_color || "#3b82f6"}
              skinTone={character?.skin_tone || "#e0ac69"}
              faceStyle={character?.face_style || "round"}
              accessory={character?.accessory}
              size="sm"
            />
            {/* Body below face */}
            <div 
              className="w-6 h-4 rounded-b-sm mx-auto -mt-1"
              style={{ backgroundColor: character?.shirt_color || "#3b82f6" }}
            />
            {/* Legs */}
            <div className="flex justify-center gap-0.5">
              <div
                className="w-2 h-2 rounded-b-sm"
                style={{ backgroundColor: character?.pants_color || "#1e3a5f" }}
              />
              <div
                className="w-2 h-2 rounded-b-sm"
                style={{ backgroundColor: character?.pants_color || "#1e3a5f" }}
              />
            </div>
            {/* Pickaxe in hand */}
            {equippedPickaxe && (
              <motion.span
                className="absolute -right-2 top-6 text-sm"
                style={{ scaleX: facingRight ? 1 : -1 }}
                animate={isMining ? { rotate: [-30, 30, -30] } : {}}
                transition={{ duration: 0.15, repeat: isMining ? Infinity : 0 }}
              >
                {equippedPickaxe.pickaxe?.icon}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Drop popups */}
        <AnimatePresence>
          {dropPopups.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute z-20 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold pointer-events-none shadow-lg"
              style={{
                left: drop.x * CELL_SIZE + CELL_SIZE / 2,
                top: drop.y * CELL_SIZE,
              }}
              initial={{ opacity: 0, y: 0, scale: 0.5, x: "-50%" }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-3 h-3" />
              +{drop.quantity} {drop.icon} {drop.name}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Next floor indicator */}
        {canAdvanceFloor && (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            transition={{ y: { duration: 1, repeat: Infinity } }}
          >
            <Button size="sm" onClick={handleNextFloor} className="shadow-lg shadow-primary/50">
              <ArrowDown className="w-4 h-4 mr-1" />
              Descer Andar
            </Button>
          </motion.div>
        )}
      </div>

      {/* Controls hint */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">W</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Espaço</kbd>
          <span>Pular/Escalar</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">A</kbd>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">D</kbd>
          <span>Mover</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🖱️</span>
          <span>Minerar</span>
        </div>
      </div>

      {/* Block legend */}
      <div className="flex justify-center gap-2 flex-wrap p-2 bg-card/50 rounded-lg border border-border">
        {Object.entries(blockStyles).map(([tier, style]) => (
          <div key={tier} className="flex items-center gap-1.5 px-2 py-1">
            <div className={cn("w-4 h-4 rounded-sm border border-black/30", style.color)} />
            <span className="text-xs text-foreground">
              <span className="font-bold">T{tier}</span> {style.name}
            </span>
          </div>
        ))}
      </div>

      {/* Touch controls for mobile */}
      <div className="flex justify-center gap-1 md:hidden">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <Button size="icon" variant="outline" onClick={() => {
            // Jump up to 2 blocks or climb up to 3
            if (canJumpTo(playerPos.y - 1)) {
              setPlayerPos({ x: playerPos.x, y: playerPos.y - 1 });
            } else if (canJumpTo(playerPos.y - 2)) {
              setPlayerPos({ x: playerPos.x, y: playerPos.y - 2 });
            } else if (canClimbTo(playerPos.y - 1, "left") || canClimbTo(playerPos.y - 1, "right")) {
              setPlayerPos({ x: playerPos.x, y: playerPos.y - 1 });
            } else if (canClimbTo(playerPos.y - 2, "left") || canClimbTo(playerPos.y - 2, "right")) {
              setPlayerPos({ x: playerPos.x, y: playerPos.y - 2 });
            } else if (canClimbTo(playerPos.y - 3, "left") || canClimbTo(playerPos.y - 3, "right")) {
              setPlayerPos({ x: playerPos.x, y: playerPos.y - 3 });
            }
          }}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <div />
          <Button size="icon" variant="outline" onClick={() => {
            setFacingRight(false);
            const newX = playerPos.x - 1;
            if (newX >= 0 && isEmptyAt(newX, playerPos.y)) {
              setPlayerPos({ x: newX, y: playerPos.y });
            }
          }}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => {
            const newY = playerPos.y + 1;
            if (newY < GRID_HEIGHT && isEmptyAt(playerPos.x, newY)) {
              setPlayerPos({ x: playerPos.x, y: newY });
            }
          }}>
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => {
            setFacingRight(true);
            const newX = playerPos.x + 1;
            if (newX < GRID_WIDTH && isEmptyAt(newX, playerPos.y)) {
              setPlayerPos({ x: newX, y: playerPos.y });
            }
          }}>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div />
        </div>
      </div>

      {/* Shop Dialog */}
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

      {/* Inventory Dialog */}
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
                        <Badge variant="default" className="text-xs">Equipada</Badge>
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
            <Button variant="outline" onClick={() => { setShowInventory(false); setShowShop(true); }}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              Ir para Loja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
