import { supabase } from "@/integrations/supabase/client";

// Material IDs by rarity
const MATERIALS = {
  common: [
    "64ff527d-9f4f-47c4-9ec7-f3beae20af6b", // Minério de Ferro
    "a004cecf-b374-4110-9e2d-d46d5de8ad2a", // Couro Curtido
  ],
  uncommon: [
    "3be30b6c-9f38-4473-a543-229f58e52eba", // Cristal Mágico
    "6e4cf4e1-1c1d-45c2-b286-49454d6c62e3", // Tecido Élfico
  ],
  rare: [
    "8f090ca5-4978-459c-a826-0ce971a1ceac", // Escamas de Dragão
    "aac73e51-923a-40ea-a3c7-b456de527b4a", // Osso de Titã
  ],
  epic: [
    "bc8c9fb4-78b5-4b8c-8f93-be02440aa623", // Essência Sombria
    "d06ed54f-69ff-4979-a85f-0f74d3eb0fc2", // Rubi Flamejante
  ],
  legendary: [
    "fce2c915-040d-4dca-bae2-8529e50f7db9", // Pó de Estrela
    "b9d89504-c7cb-4eda-9ac4-7118e9149cfe", // Lágrima de Fênix
  ],
};

// Drop chances by activity difficulty
export type ActivityType = "mission" | "dungeon" | "arena_npc" | "arena_pvp";
export type Difficulty = "easy" | "medium" | "hard" | "boss";

interface DropConfig {
  dropChance: number; // Base chance to get any drop
  rarityWeights: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  maxDrops: number;
}

const DROP_CONFIGS: Record<ActivityType, Record<Difficulty | "default", DropConfig>> = {
  mission: {
    easy: {
      dropChance: 0.4,
      rarityWeights: { common: 80, uncommon: 18, rare: 2, epic: 0, legendary: 0 },
      maxDrops: 1,
    },
    medium: {
      dropChance: 0.55,
      rarityWeights: { common: 60, uncommon: 30, rare: 8, epic: 2, legendary: 0 },
      maxDrops: 2,
    },
    hard: {
      dropChance: 0.7,
      rarityWeights: { common: 40, uncommon: 35, rare: 18, epic: 6, legendary: 1 },
      maxDrops: 2,
    },
    boss: {
      dropChance: 0.9,
      rarityWeights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
      maxDrops: 3,
    },
    default: {
      dropChance: 0.4,
      rarityWeights: { common: 80, uncommon: 18, rare: 2, epic: 0, legendary: 0 },
      maxDrops: 1,
    },
  },
  dungeon: {
    easy: {
      dropChance: 0.6,
      rarityWeights: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
      maxDrops: 2,
    },
    medium: {
      dropChance: 0.75,
      rarityWeights: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
      maxDrops: 3,
    },
    hard: {
      dropChance: 0.85,
      rarityWeights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 },
      maxDrops: 3,
    },
    boss: {
      dropChance: 0.95,
      rarityWeights: { common: 10, uncommon: 20, rare: 35, epic: 25, legendary: 10 },
      maxDrops: 4,
    },
    default: {
      dropChance: 0.7,
      rarityWeights: { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
      maxDrops: 2,
    },
  },
  arena_npc: {
    easy: {
      dropChance: 0.25,
      rarityWeights: { common: 85, uncommon: 13, rare: 2, epic: 0, legendary: 0 },
      maxDrops: 1,
    },
    medium: {
      dropChance: 0.35,
      rarityWeights: { common: 70, uncommon: 25, rare: 4, epic: 1, legendary: 0 },
      maxDrops: 1,
    },
    hard: {
      dropChance: 0.45,
      rarityWeights: { common: 55, uncommon: 30, rare: 12, epic: 3, legendary: 0 },
      maxDrops: 2,
    },
    boss: {
      dropChance: 0.6,
      rarityWeights: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
      maxDrops: 2,
    },
    default: {
      dropChance: 0.3,
      rarityWeights: { common: 75, uncommon: 20, rare: 4, epic: 1, legendary: 0 },
      maxDrops: 1,
    },
  },
  arena_pvp: {
    easy: {
      dropChance: 0.3,
      rarityWeights: { common: 60, uncommon: 30, rare: 8, epic: 2, legendary: 0 },
      maxDrops: 1,
    },
    medium: {
      dropChance: 0.45,
      rarityWeights: { common: 45, uncommon: 35, rare: 15, epic: 4, legendary: 1 },
      maxDrops: 2,
    },
    hard: {
      dropChance: 0.55,
      rarityWeights: { common: 35, uncommon: 35, rare: 20, epic: 8, legendary: 2 },
      maxDrops: 2,
    },
    boss: {
      dropChance: 0.65,
      rarityWeights: { common: 25, uncommon: 30, rare: 25, epic: 15, legendary: 5 },
      maxDrops: 3,
    },
    default: {
      dropChance: 0.4,
      rarityWeights: { common: 50, uncommon: 32, rare: 13, epic: 4, legendary: 1 },
      maxDrops: 1,
    },
  },
};

export interface MaterialDrop {
  materialId: string;
  materialName: string;
  rarity: string;
  quantity: number;
  icon: string;
}

function selectRarity(weights: DropConfig["rarityWeights"]): keyof typeof MATERIALS {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const [rarity, weight] of Object.entries(weights) as [keyof typeof weights, number][]) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return "common";
}

function selectMaterial(rarity: keyof typeof MATERIALS): string {
  const materials = MATERIALS[rarity];
  return materials[Math.floor(Math.random() * materials.length)];
}

export async function generateMaterialDrops(
  userId: string,
  activityType: ActivityType,
  difficulty: Difficulty = "medium"
): Promise<MaterialDrop[]> {
  const config = DROP_CONFIGS[activityType][difficulty] || DROP_CONFIGS[activityType].default;
  const drops: MaterialDrop[] = [];

  // Determine number of drops
  for (let i = 0; i < config.maxDrops; i++) {
    if (Math.random() > config.dropChance) continue;

    const rarity = selectRarity(config.rarityWeights);
    const materialId = selectMaterial(rarity);
    
    // Check if this material was already dropped
    const existingDrop = drops.find((d) => d.materialId === materialId);
    if (existingDrop) {
      existingDrop.quantity++;
    } else {
      drops.push({
        materialId,
        materialName: "",
        rarity,
        quantity: 1,
        icon: "",
      });
    }
  }

  if (drops.length === 0) return [];

  // Get material details
  const materialIds = drops.map((d) => d.materialId);
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, icon")
    .in("id", materialIds);

  // Update drop names and icons
  for (const drop of drops) {
    const material = materials?.find((m) => m.id === drop.materialId);
    if (material) {
      drop.materialName = material.name;
      drop.icon = material.icon || "📦";
    }
  }

  // Add materials to player inventory
  for (const drop of drops) {
    // Check if player already has this material
    const { data: existing } = await supabase
      .from("player_materials")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("material_id", drop.materialId)
      .single();

    if (existing) {
      await supabase
        .from("player_materials")
        .update({ quantity: existing.quantity + drop.quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("player_materials").insert({
        user_id: userId,
        material_id: drop.materialId,
        quantity: drop.quantity,
      });
    }
  }

  return drops;
}

export function formatDropMessage(drops: MaterialDrop[]): string {
  if (drops.length === 0) return "";
  
  const items = drops
    .map((d) => `${d.icon} ${d.quantity}x ${d.materialName}`)
    .join(", ");
  
  return `Materiais obtidos: ${items}`;
}
