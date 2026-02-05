 import { useState } from "react";
 import { LayeredPixelAvatar } from "./LayeredPixelAvatar";
 import { Button } from "@/components/ui/button";
 import { Check, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   AvatarCustomization,
   LayerType,
   layerOptions,
   colorPalettes,
   defaultCustomization,
   getLayerOption,
   getColorPalette,
   serializeCustomization,
   deserializeCustomization,
 } from "@/data/avatarLayers";
 
 interface LayeredAvatarCustomizerProps {
   initialCustomization?: string | null;
   onSave: (customization: string) => void;
   onCancel?: () => void;
   isSaving?: boolean;
 }
 
 const layerLabels: Record<LayerType, { icon: string; label: string }> = {
   body: { icon: "👤", label: "Corpo" },
   eyes: { icon: "👁️", label: "Olhos" },
   hair: { icon: "💇", label: "Cabelo" },
   top: { icon: "👕", label: "Roupa" },
   bottom: { icon: "👖", label: "Calça" },
   accessory: { icon: "✨", label: "Acessório" },
 };
 
 const editableLayers: LayerType[] = ["body", "eyes", "hair", "top", "bottom", "accessory"];
 
 export function LayeredAvatarCustomizer({
   initialCustomization,
   onSave,
   onCancel,
   isSaving = false,
 }: LayeredAvatarCustomizerProps) {
   const [customization, setCustomization] = useState<AvatarCustomization>(
     deserializeCustomization(initialCustomization || null)
   );
   const [activeLayer, setActiveLayer] = useState<LayerType>("hair");
 
   const updateLayer = (type: LayerType, optionId: string) => {
     const option = getLayerOption(type, optionId);
     setCustomization((prev) => ({
       ...prev,
       [type]: {
         optionId,
         paletteId: option?.defaultPalette || prev[type].paletteId,
       },
     }));
   };
 
   const updatePalette = (type: LayerType, paletteId: string) => {
     setCustomization((prev) => ({
       ...prev,
       [type]: {
         ...prev[type],
         paletteId,
       },
     }));
   };
 
   const randomize = () => {
     const newCustomization: AvatarCustomization = { ...defaultCustomization };
     
     for (const type of editableLayers) {
       const options = layerOptions[type];
       const palettes = colorPalettes[type];
       
       const randomOption = options[Math.floor(Math.random() * options.length)];
       const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
       
       newCustomization[type] = {
         optionId: randomOption.id,
         paletteId: randomOption.allowColorChange ? randomPalette.id : (randomOption.defaultPalette || palettes[0].id),
       };
     }
     
     setCustomization(newCustomization);
   };
 
   const currentLayerConfig = customization[activeLayer];
   const currentOption = getLayerOption(activeLayer, currentLayerConfig.optionId);
   const availableOptions = layerOptions[activeLayer];
   const availablePalettes = colorPalettes[activeLayer];
 
   return (
     <div className="space-y-6">
       {/* Preview */}
       <div className="flex flex-col items-center gap-4">
         <LayeredPixelAvatar customization={customization} size="xl" />
         <Button variant="outline" size="sm" onClick={randomize} className="gap-2">
           <Shuffle className="w-4 h-4" />
           Aleatório
         </Button>
       </div>
 
       {/* Layer Tabs */}
       <Tabs value={activeLayer} onValueChange={(v) => setActiveLayer(v as LayerType)}>
         <TabsList className="grid grid-cols-6 w-full">
           {editableLayers.map((type) => (
             <TabsTrigger key={type} value={type} className="text-xs px-1">
               <span className="hidden sm:inline">{layerLabels[type].icon}</span>
               <span className="sm:ml-1">{layerLabels[type].label}</span>
             </TabsTrigger>
           ))}
         </TabsList>
 
         {editableLayers.map((type) => (
           <TabsContent key={type} value={type} className="space-y-4 mt-4">
             {/* Style Options */}
             <div>
               <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Estilo</h4>
               <ScrollArea className="w-full">
                 <div className="flex gap-2 pb-2">
                   {layerOptions[type].map((option) => (
                     <button
                       key={option.id}
                       onClick={() => updateLayer(type, option.id)}
                       className={cn(
                         "flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 hover:scale-105",
                         customization[type].optionId === option.id
                           ? "border-primary bg-primary/20"
                           : "border-border hover:border-primary/50"
                       )}
                     >
                       <div
                         className="w-10 h-10 rounded"
                         style={{
                           backgroundColor: option.previewColor || "#888",
                           opacity: option.previewColor === "transparent" ? 0.3 : 1,
                         }}
                       />
                       <span className="text-[10px] text-center leading-tight">{option.name}</span>
                     </button>
                   ))}
                 </div>
               </ScrollArea>
             </div>
 
             {/* Color Palette */}
             {currentOption?.allowColorChange && (
               <div>
                 <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Cor</h4>
                 <div className="flex flex-wrap gap-2">
                   {colorPalettes[type].map((palette) => (
                     <button
                       key={palette.id}
                       onClick={() => updatePalette(type, palette.id)}
                       className={cn(
                         "w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 relative overflow-hidden",
                         customization[type].paletteId === palette.id
                           ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                           : "border-border hover:border-primary/50"
                       )}
                       title={palette.name}
                     >
                       <div
                         className="absolute inset-0"
                         style={{
                           background: `linear-gradient(135deg, ${palette.colors[0]} 50%, ${palette.colors[1] || palette.colors[0]} 50%)`,
                         }}
                       />
                       {customization[type].paletteId === palette.id && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                           <Check className="w-4 h-4 text-white" />
                         </div>
                       )}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </TabsContent>
         ))}
       </Tabs>
 
       {/* Actions */}
       <div className="flex gap-3 pt-4 border-t border-border">
         {onCancel && (
           <Button variant="outline" onClick={onCancel} className="flex-1">
             Cancelar
           </Button>
         )}
         <Button
           onClick={() => onSave(serializeCustomization(customization))}
           disabled={isSaving}
           className="flex-1 gap-2"
         >
           <Check className="w-4 h-4" />
           {isSaving ? "Salvando..." : "Salvar Avatar"}
         </Button>
       </div>
     </div>
   );
 }