import { useState } from "react";
import { VisualAvatar, AvatarCustomization, VipClothingDisplay } from "./VisualAvatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Scissors, 
  Eye, 
  User,
  Sparkles,
  Shirt,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarCustomizerProps {
  initialCustomization: AvatarCustomization;
  onSave: (customization: AvatarCustomization) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  vipClothing?: VipClothingDisplay | null;
}

const hairStyles = [
  { id: "short", label: "Curto" },
  { id: "long", label: "Longo" },
  { id: "spiky", label: "Espetado" },
  { id: "curly", label: "Cacheado" },
  { id: "mohawk", label: "Moicano" },
  { id: "ponytail", label: "Rabo de Cavalo" },
  { id: "bald", label: "Careca" },
];

const hairColors = [
  { id: "#1a1a1a", label: "Preto" },
  { id: "#4a3728", label: "Castanho" },
  { id: "#8b6914", label: "Loiro Escuro" },
  { id: "#daa520", label: "Loiro" },
  { id: "#b7410e", label: "Ruivo" },
  { id: "#808080", label: "Grisalho" },
  { id: "#ffffff", label: "Branco" },
  { id: "#dc2626", label: "Vermelho" },
  { id: "#3b82f6", label: "Azul" },
  { id: "#a855f7", label: "Roxo" },
  { id: "#22c55e", label: "Verde" },
  { id: "#ec4899", label: "Rosa" },
];

const eyeColors = [
  { id: "#4a3728", label: "Castanho" },
  { id: "#3b82f6", label: "Azul" },
  { id: "#22c55e", label: "Verde" },
  { id: "#808080", label: "Cinza" },
  { id: "#fbbf24", label: "Âmbar" },
  { id: "#1a1a1a", label: "Preto" },
  { id: "#dc2626", label: "Vermelho" },
  { id: "#a855f7", label: "Violeta" },
];

const skinTones = [
  { id: "#ffe4c4", label: "Claro" },
  { id: "#e0ac69", label: "Médio Claro" },
  { id: "#c68642", label: "Médio" },
  { id: "#8d5524", label: "Médio Escuro" },
  { id: "#5c3317", label: "Escuro" },
  { id: "#3b2010", label: "Muito Escuro" },
];

const faceStyles = [
  { id: "round", label: "Redondo" },
  { id: "oval", label: "Oval" },
  { id: "square", label: "Quadrado" },
  { id: "heart", label: "Coração" },
];

const accessoryOptions = [
  { id: null, label: "Nenhum" },
  { id: "glasses", label: "Óculos" },
  { id: "earring", label: "Brincos" },
  { id: "scar", label: "Cicatriz" },
  { id: "eyepatch", label: "Tapa-olho" },
  { id: "headband", label: "Bandana" },
  { id: "crown", label: "Coroa" },
];

const clothingColors = [
  { id: "#1a1a1a", label: "Preto" },
  { id: "#4a3728", label: "Marrom" },
  { id: "#1e3a5f", label: "Azul Escuro" },
  { id: "#3b82f6", label: "Azul" },
  { id: "#dc2626", label: "Vermelho" },
  { id: "#22c55e", label: "Verde" },
  { id: "#a855f7", label: "Roxo" },
  { id: "#f59e0b", label: "Laranja" },
  { id: "#ec4899", label: "Rosa" },
  { id: "#ffffff", label: "Branco" },
  { id: "#6b7280", label: "Cinza" },
  { id: "#ffd700", label: "Dourado" },
];

type TabType = "hair" | "face" | "eyes" | "accessory" | "clothes";

const tabs: { id: TabType; label: string; icon: typeof Scissors }[] = [
  { id: "hair", label: "Cabelo", icon: Scissors },
  { id: "face", label: "Rosto", icon: User },
  { id: "eyes", label: "Olhos", icon: Eye },
  { id: "clothes", label: "Roupas", icon: Shirt },
  { id: "accessory", label: "Acessório", icon: Sparkles },
];

export function AvatarCustomizer({ 
  initialCustomization, 
  onSave, 
  onCancel,
  isSaving = false,
  vipClothing
}: AvatarCustomizerProps) {
  const [customization, setCustomization] = useState<AvatarCustomization>(initialCustomization);
  const [activeTab, setActiveTab] = useState<TabType>("hair");

  const updateCustomization = (key: keyof AvatarCustomization, value: string | null) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const renderColorPicker = (
    colors: { id: string; label: string }[],
    selectedColor: string,
    onChange: (color: string) => void
  ) => (
    <div className="grid grid-cols-6 gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onChange(color.id)}
          className={cn(
            "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
            selectedColor === color.id 
              ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" 
              : "border-border hover:border-primary/50"
          )}
          style={{ backgroundColor: color.id }}
          title={color.label}
        >
          {selectedColor === color.id && (
            <Check className="w-4 h-4 mx-auto text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
          )}
        </button>
      ))}
    </div>
  );

  const renderStylePicker = (
    styles: { id: string; label: string }[],
    selectedStyle: string,
    onChange: (style: string) => void
  ) => (
    <RadioGroup value={selectedStyle} onValueChange={onChange} className="grid grid-cols-2 gap-2">
      {styles.map((style) => (
        <div key={style.id} className="flex items-center space-x-2">
          <RadioGroupItem value={style.id} id={style.id} />
          <Label htmlFor={style.id} className="cursor-pointer">{style.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "hair":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Estilo do Cabelo</Label>
              {renderStylePicker(hairStyles, customization.hairStyle, (v) => updateCustomization("hairStyle", v))}
            </div>
            {customization.hairStyle !== "bald" && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Cor do Cabelo</Label>
                {renderColorPicker(hairColors, customization.hairColor, (v) => updateCustomization("hairColor", v))}
              </div>
            )}
          </div>
        );
      case "face":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Formato do Rosto</Label>
              {renderStylePicker(faceStyles, customization.faceStyle, (v) => updateCustomization("faceStyle", v))}
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Tom de Pele</Label>
              {renderColorPicker(skinTones, customization.skinTone, (v) => updateCustomization("skinTone", v))}
            </div>
          </div>
        );
      case "eyes":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Cor dos Olhos</Label>
              {renderColorPicker(eyeColors, customization.eyeColor, (v) => updateCustomization("eyeColor", v))}
            </div>
          </div>
        );
      case "clothes":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Cor da Camisa</Label>
              {renderColorPicker(clothingColors, customization.shirtColor, (v) => updateCustomization("shirtColor", v))}
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Cor da Calça</Label>
              {renderColorPicker(clothingColors, customization.pantsColor, (v) => updateCustomization("pantsColor", v))}
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Cor do Sapato</Label>
              {renderColorPicker(clothingColors, customization.shoesColor, (v) => updateCustomization("shoesColor", v))}
            </div>
          </div>
        );
      case "accessory":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Acessório</Label>
              <RadioGroup 
                value={customization.accessory || "none"} 
                onValueChange={(v) => updateCustomization("accessory", v === "none" ? null : v)} 
                className="grid grid-cols-2 gap-2"
              >
                {accessoryOptions.map((acc) => (
                  <div key={acc.id || "none"} className="flex items-center space-x-2">
                    <RadioGroupItem value={acc.id || "none"} id={acc.id || "none"} />
                    <Label htmlFor={acc.id || "none"} className="cursor-pointer">{acc.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <VisualAvatar customization={customization} size="xl" vipClothing={vipClothing} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
            Prévia
          </div>
        </div>
      </div>

      {/* VIP Notice */}
      {vipClothing?.hair && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
          <p className="text-sm text-primary">
            ✨ Cabelo VIP equipado: <strong>{vipClothing.hair.name}</strong>
          </p>
          <p className="text-xs text-muted-foreground">Desequipe na Loja VIP para usar cabelos básicos</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-1 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="gap-1"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-secondary/30 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button 
          onClick={() => onSave(customization)} 
          disabled={isSaving}
          className="flex-1 gap-2"
        >
          <Check className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar Aparência"}
        </Button>
      </div>
    </div>
  );
}
