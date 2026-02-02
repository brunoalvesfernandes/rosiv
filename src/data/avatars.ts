// Avatar assets - pixel art style
import warriors from "@/assets/avatars/base-warriors.png";
import mages from "@/assets/avatars/base-mages.png";

export interface AvatarOption {
  id: string;
  name: string;
  class: "warrior" | "mage" | "archer";
  image: string;
  description: string;
}

// Using the warrior sprite sheet - we'll display specific characters from it
export const avatarOptions: AvatarOption[] = [
  {
    id: "warrior-1",
    name: "Guerreiro Loiro",
    class: "warrior",
    image: warriors,
    description: "Um bravo guerreiro com armadura azul",
  },
  {
    id: "warrior-2", 
    name: "Guerreiro Moreno",
    class: "warrior",
    image: warriors,
    description: "Guerreiro veterano com armadura pesada",
  },
  {
    id: "warrior-3",
    name: "Guerreiro Verde",
    class: "warrior", 
    image: warriors,
    description: "Guerreiro das florestas com capuz",
  },
  {
    id: "warrior-4",
    name: "Guerreiro Azul",
    class: "warrior",
    image: warriors,
    description: "Guerreiro experiente de cabelo azul",
  },
  {
    id: "mage-1",
    name: "Mago Vermelho",
    class: "mage",
    image: mages,
    description: "Mago sábio com manto vermelho",
  },
  {
    id: "mage-2",
    name: "Mago Verde",
    class: "mage",
    image: mages,
    description: "Mago misterioso de barba longa",
  },
  {
    id: "mage-3",
    name: "Mago Azul",
    class: "mage",
    image: mages,
    description: "Arquimago com cajado dourado",
  },
  {
    id: "mage-4",
    name: "Mago Ancião",
    class: "mage",
    image: mages,
    description: "Mago ancião com barba branca",
  },
];

// Get avatar by ID
export function getAvatarById(id: string): AvatarOption | undefined {
  return avatarOptions.find((avatar) => avatar.id === id);
}

// Get avatars by class
export function getAvatarsByClass(characterClass: "warrior" | "mage" | "archer"): AvatarOption[] {
  return avatarOptions.filter((avatar) => avatar.class === characterClass);
}
