import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CharacterClass = "warrior" | "mage" | "archer";

export interface ClassInfo {
  id: CharacterClass;
  name: string;
  description: string;
  icon: string;
  primaryStat: string;
  skills: {
    name: string;
    description: string;
    manaCost: number;
    damage: number;
    type: "attack" | "buff" | "heal";
  }[];
}

export const CLASS_DATA: Record<CharacterClass, ClassInfo> = {
  warrior: {
    id: "warrior",
    name: "Guerreiro",
    description: "Mestre em combate corpo a corpo. Alta força e defesa.",
    icon: "⚔️",
    primaryStat: "Força",
    skills: [
      {
        name: "Golpe Brutal",
        description: "Um ataque devastador que causa dano massivo.",
        manaCost: 15,
        damage: 50,
        type: "attack",
      },
      {
        name: "Grito de Guerra",
        description: "Aumenta temporariamente sua força.",
        manaCost: 10,
        damage: 0,
        type: "buff",
      },
      {
        name: "Investida",
        description: "Avança contra o inimigo causando dano e atordoando.",
        manaCost: 20,
        damage: 35,
        type: "attack",
      },
    ],
  },
  mage: {
    id: "mage",
    name: "Mago",
    description: "Domina as artes arcanas. Alta mana e dano mágico.",
    icon: "🔮",
    primaryStat: "Mana",
    skills: [
      {
        name: "Bola de Fogo",
        description: "Lança uma bola de fogo devastadora.",
        manaCost: 20,
        damage: 60,
        type: "attack",
      },
      {
        name: "Escudo Arcano",
        description: "Cria um escudo mágico protetor.",
        manaCost: 15,
        damage: 0,
        type: "buff",
      },
      {
        name: "Raio Gélido",
        description: "Congela o inimigo causando dano contínuo.",
        manaCost: 25,
        damage: 45,
        type: "attack",
      },
    ],
  },
  archer: {
    id: "archer",
    name: "Arqueiro",
    description: "Especialista em ataques à distância. Alta agilidade e precisão.",
    icon: "🏹",
    primaryStat: "Agilidade",
    skills: [
      {
        name: "Tiro Certeiro",
        description: "Um tiro preciso que nunca erra.",
        manaCost: 12,
        damage: 40,
        type: "attack",
      },
      {
        name: "Chuva de Flechas",
        description: "Dispara múltiplas flechas de uma vez.",
        manaCost: 25,
        damage: 55,
        type: "attack",
      },
      {
        name: "Evasão",
        description: "Aumenta sua agilidade temporariamente.",
        manaCost: 10,
        damage: 0,
        type: "buff",
      },
    ],
  },
};

export function useChangeClass() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newClass: CharacterClass) => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("characters")
        .update({ class: newClass })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      toast.success("Classe alterada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSkill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      skillIndex,
      characterClass,
    }: {
      skillIndex: number;
      characterClass: CharacterClass;
    }) => {
      if (!user) throw new Error("Não autenticado");

      const skill = CLASS_DATA[characterClass].skills[skillIndex];
      if (!skill) throw new Error("Habilidade não encontrada");

      // Get character
      const { data: character, error: charError } = await supabase
        .from("characters")
        .select("current_mana")
        .eq("user_id", user.id)
        .single();

      if (charError || !character) throw new Error("Personagem não encontrado");

      if (character.current_mana < skill.manaCost) {
        throw new Error(`Mana insuficiente (${skill.manaCost} necessários)`);
      }

      // Deduct mana
      const { error } = await supabase
        .from("characters")
        .update({ current_mana: character.current_mana - skill.manaCost })
        .eq("user_id", user.id);

      if (error) throw error;

      return { skill, damage: skill.damage };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["character"] });
      if (result.skill.type === "attack") {
        toast.success(`${result.skill.name} causou ${result.damage} de dano!`);
      } else {
        toast.success(`${result.skill.name} ativado!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
