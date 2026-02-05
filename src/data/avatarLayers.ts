 // Avatar Layers System - Pixel Art Style
 // Each layer is rendered on top of the previous one
 
 export type LayerType = "body" | "eyes" | "hair" | "top" | "bottom" | "accessory";
 
 export interface ColorPalette {
   id: string;
   name: string;
   colors: string[]; // Array of hex colors for the palette
 }
 
 export interface LayerOption {
   id: string;
   name: string;
   type: LayerType;
   image?: string; // URL to sprite image (optional for placeholder)
   previewColor?: string; // Placeholder color for testing
   allowColorChange?: boolean;
   defaultPalette?: string;
 }
 
 // Color palettes for customizable items
 export const colorPalettes: Record<LayerType, ColorPalette[]> = {
   body: [
     { id: "skin-1", name: "Clara", colors: ["#FFDCB5", "#E8C39E", "#D4A574"] },
     { id: "skin-2", name: "Média", colors: ["#E0A86E", "#C9935A", "#B07D4A"] },
     { id: "skin-3", name: "Morena", colors: ["#A67C52", "#8B6442", "#704D2E"] },
     { id: "skin-4", name: "Escura", colors: ["#6B4423", "#5A3A1D", "#4A2F17"] },
   ],
   eyes: [
     { id: "eyes-blue", name: "Azul", colors: ["#4A90D9", "#3366CC"] },
     { id: "eyes-green", name: "Verde", colors: ["#4CAF50", "#2E7D32"] },
     { id: "eyes-brown", name: "Castanho", colors: ["#795548", "#5D4037"] },
     { id: "eyes-red", name: "Vermelho", colors: ["#F44336", "#C62828"] },
     { id: "eyes-purple", name: "Roxo", colors: ["#9C27B0", "#6A1B9A"] },
     { id: "eyes-gold", name: "Dourado", colors: ["#FFC107", "#FF8F00"] },
   ],
   hair: [
     { id: "hair-black", name: "Preto", colors: ["#1A1A1A", "#0D0D0D"] },
     { id: "hair-brown", name: "Castanho", colors: ["#5D4037", "#3E2723"] },
     { id: "hair-blonde", name: "Loiro", colors: ["#FFD54F", "#FFCA28"] },
     { id: "hair-red", name: "Ruivo", colors: ["#E64A19", "#BF360C"] },
     { id: "hair-blue", name: "Azul", colors: ["#29B6F6", "#0288D1"] },
     { id: "hair-pink", name: "Rosa", colors: ["#F48FB1", "#EC407A"] },
     { id: "hair-white", name: "Branco", colors: ["#ECEFF1", "#CFD8DC"] },
     { id: "hair-purple", name: "Roxo", colors: ["#AB47BC", "#7B1FA2"] },
   ],
   top: [
     { id: "top-gray", name: "Cinza", colors: ["#607D8B", "#455A64"] },
     { id: "top-red", name: "Vermelho", colors: ["#F44336", "#C62828"] },
     { id: "top-blue", name: "Azul", colors: ["#2196F3", "#1565C0"] },
     { id: "top-green", name: "Verde", colors: ["#4CAF50", "#2E7D32"] },
     { id: "top-purple", name: "Roxo", colors: ["#9C27B0", "#6A1B9A"] },
     { id: "top-gold", name: "Dourado", colors: ["#FFB300", "#FF8F00"] },
     { id: "top-black", name: "Preto", colors: ["#212121", "#0D0D0D"] },
     { id: "top-white", name: "Branco", colors: ["#FAFAFA", "#E0E0E0"] },
   ],
   bottom: [
     { id: "bottom-gray", name: "Cinza", colors: ["#546E7A", "#37474F"] },
     { id: "bottom-brown", name: "Marrom", colors: ["#795548", "#4E342E"] },
     { id: "bottom-blue", name: "Azul", colors: ["#1976D2", "#0D47A1"] },
     { id: "bottom-black", name: "Preto", colors: ["#212121", "#0D0D0D"] },
     { id: "bottom-green", name: "Verde", colors: ["#388E3C", "#1B5E20"] },
     { id: "bottom-red", name: "Vermelho", colors: ["#D32F2F", "#B71C1C"] },
   ],
   accessory: [
     { id: "acc-none", name: "Nenhum", colors: ["transparent"] },
     { id: "acc-gold", name: "Dourado", colors: ["#FFD700", "#FFA000"] },
     { id: "acc-silver", name: "Prateado", colors: ["#C0C0C0", "#9E9E9E"] },
     { id: "acc-red", name: "Vermelho", colors: ["#F44336", "#C62828"] },
     { id: "acc-blue", name: "Azul", colors: ["#2196F3", "#1565C0"] },
   ],
 };
 
 // Layer options - each type has multiple style options
 export const layerOptions: Record<LayerType, LayerOption[]> = {
   body: [
     { id: "body-1", name: "Corpo Padrão", type: "body", previewColor: "#FFDCB5", allowColorChange: true, defaultPalette: "skin-1" },
   ],
   eyes: [
     { id: "eyes-round", name: "Redondos", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-sharp", name: "Afiados", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-soft", name: "Suaves", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-fierce", name: "Ferozes", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-cute", name: "Fofos", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-tired", name: "Cansados", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-happy", name: "Felizes", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
     { id: "eyes-angry", name: "Bravos", type: "eyes", previewColor: "#4A90D9", allowColorChange: true, defaultPalette: "eyes-blue" },
   ],
   hair: [
     { id: "hair-short", name: "Curto", type: "hair", previewColor: "#5D4037", allowColorChange: true, defaultPalette: "hair-brown" },
     { id: "hair-spiky", name: "Espetado", type: "hair", previewColor: "#1A1A1A", allowColorChange: true, defaultPalette: "hair-black" },
     { id: "hair-long", name: "Longo", type: "hair", previewColor: "#5D4037", allowColorChange: true, defaultPalette: "hair-brown" },
     { id: "hair-ponytail", name: "Rabo de Cavalo", type: "hair", previewColor: "#FFD54F", allowColorChange: true, defaultPalette: "hair-blonde" },
     { id: "hair-mohawk", name: "Moicano", type: "hair", previewColor: "#E64A19", allowColorChange: true, defaultPalette: "hair-red" },
     { id: "hair-curly", name: "Cacheado", type: "hair", previewColor: "#5D4037", allowColorChange: true, defaultPalette: "hair-brown" },
     { id: "hair-bald", name: "Careca", type: "hair", previewColor: "transparent", allowColorChange: false },
     { id: "hair-samurai", name: "Samurai", type: "hair", previewColor: "#1A1A1A", allowColorChange: true, defaultPalette: "hair-black" },
     { id: "hair-wizard", name: "Mago", type: "hair", previewColor: "#ECEFF1", allowColorChange: true, defaultPalette: "hair-white" },
     { id: "hair-anime", name: "Anime", type: "hair", previewColor: "#29B6F6", allowColorChange: true, defaultPalette: "hair-blue" },
   ],
   top: [
     { id: "top-tshirt", name: "Camiseta", type: "top", previewColor: "#607D8B", allowColorChange: true, defaultPalette: "top-gray" },
     { id: "top-armor", name: "Armadura", type: "top", previewColor: "#546E7A", allowColorChange: true, defaultPalette: "top-gray" },
     { id: "top-robe", name: "Manto", type: "top", previewColor: "#9C27B0", allowColorChange: true, defaultPalette: "top-purple" },
     { id: "top-jacket", name: "Jaqueta", type: "top", previewColor: "#212121", allowColorChange: true, defaultPalette: "top-black" },
     { id: "top-vest", name: "Colete", type: "top", previewColor: "#795548", allowColorChange: true, defaultPalette: "top-gray" },
     { id: "top-hoodie", name: "Moletom", type: "top", previewColor: "#37474F", allowColorChange: true, defaultPalette: "top-gray" },
     { id: "top-knight", name: "Cavaleiro", type: "top", previewColor: "#FFB300", allowColorChange: true, defaultPalette: "top-gold" },
     { id: "top-ninja", name: "Ninja", type: "top", previewColor: "#212121", allowColorChange: true, defaultPalette: "top-black" },
     { id: "top-royal", name: "Real", type: "top", previewColor: "#7B1FA2", allowColorChange: true, defaultPalette: "top-purple" },
     { id: "top-pirate", name: "Pirata", type: "top", previewColor: "#F44336", allowColorChange: true, defaultPalette: "top-red" },
   ],
   bottom: [
     { id: "bottom-pants", name: "Calça", type: "bottom", previewColor: "#546E7A", allowColorChange: true, defaultPalette: "bottom-gray" },
     { id: "bottom-shorts", name: "Shorts", type: "bottom", previewColor: "#1976D2", allowColorChange: true, defaultPalette: "bottom-blue" },
     { id: "bottom-armor", name: "Armadura", type: "bottom", previewColor: "#455A64", allowColorChange: true, defaultPalette: "bottom-gray" },
     { id: "bottom-robe", name: "Túnica", type: "bottom", previewColor: "#4E342E", allowColorChange: true, defaultPalette: "bottom-brown" },
     { id: "bottom-skirt", name: "Saia", type: "bottom", previewColor: "#D32F2F", allowColorChange: true, defaultPalette: "bottom-red" },
     { id: "bottom-baggy", name: "Folgada", type: "bottom", previewColor: "#212121", allowColorChange: true, defaultPalette: "bottom-black" },
     { id: "bottom-knight", name: "Cavaleiro", type: "bottom", previewColor: "#37474F", allowColorChange: true, defaultPalette: "bottom-gray" },
     { id: "bottom-ninja", name: "Ninja", type: "bottom", previewColor: "#212121", allowColorChange: true, defaultPalette: "bottom-black" },
   ],
   accessory: [
     { id: "acc-none", name: "Nenhum", type: "accessory", previewColor: "transparent", allowColorChange: false },
     { id: "acc-glasses", name: "Óculos", type: "accessory", previewColor: "#212121", allowColorChange: true, defaultPalette: "acc-gold" },
     { id: "acc-earring", name: "Brinco", type: "accessory", previewColor: "#FFD700", allowColorChange: true, defaultPalette: "acc-gold" },
     { id: "acc-scar", name: "Cicatriz", type: "accessory", previewColor: "#8D6E63", allowColorChange: false },
     { id: "acc-bandana", name: "Bandana", type: "accessory", previewColor: "#F44336", allowColorChange: true, defaultPalette: "acc-red" },
     { id: "acc-eyepatch", name: "Tapa-olho", type: "accessory", previewColor: "#212121", allowColorChange: false },
     { id: "acc-crown", name: "Coroa", type: "accessory", previewColor: "#FFD700", allowColorChange: true, defaultPalette: "acc-gold" },
     { id: "acc-headband", name: "Tiara", type: "accessory", previewColor: "#C0C0C0", allowColorChange: true, defaultPalette: "acc-silver" },
     { id: "acc-mask", name: "Máscara", type: "accessory", previewColor: "#FFFFFF", allowColorChange: true, defaultPalette: "acc-silver" },
     { id: "acc-horns", name: "Chifres", type: "accessory", previewColor: "#8D6E63", allowColorChange: false },
   ],
 };
 
 // Avatar customization state
 export interface AvatarCustomization {
   body: { optionId: string; paletteId: string };
   eyes: { optionId: string; paletteId: string };
   hair: { optionId: string; paletteId: string };
   top: { optionId: string; paletteId: string };
   bottom: { optionId: string; paletteId: string };
   accessory: { optionId: string; paletteId: string };
 }
 
 // Default customization
 export const defaultCustomization: AvatarCustomization = {
   body: { optionId: "body-1", paletteId: "skin-1" },
   eyes: { optionId: "eyes-round", paletteId: "eyes-blue" },
   hair: { optionId: "hair-short", paletteId: "hair-brown" },
   top: { optionId: "top-tshirt", paletteId: "top-gray" },
   bottom: { optionId: "bottom-pants", paletteId: "bottom-gray" },
   accessory: { optionId: "acc-none", paletteId: "acc-none" },
 };
 
 // Helper to get option by id
 export function getLayerOption(type: LayerType, optionId: string): LayerOption | undefined {
   return layerOptions[type].find(opt => opt.id === optionId);
 }
 
 // Helper to get palette by id
 export function getColorPalette(type: LayerType, paletteId: string): ColorPalette | undefined {
   return colorPalettes[type].find(p => p.id === paletteId);
 }
 
 // Serialize customization to string for storage
 export function serializeCustomization(customization: AvatarCustomization): string {
   return JSON.stringify(customization);
 }
 
 // Deserialize customization from string
 export function deserializeCustomization(data: string | null): AvatarCustomization {
   if (!data) return defaultCustomization;
   try {
     return JSON.parse(data) as AvatarCustomization;
   } catch {
     return defaultCustomization;
   }
 }