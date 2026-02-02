import { GameLayout } from "@/components/layout/GameLayout";
import { AvatarCustomizer } from "@/components/game/AvatarCustomizer";
import { AvatarCustomization } from "@/components/game/VisualAvatar";
import { useCharacter, useUpdateCharacter } from "@/hooks/useCharacter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CharacterCustomization() {
  const { data: character, isLoading } = useCharacter();
  const updateCharacter = useUpdateCharacter();
  const navigate = useNavigate();

  if (isLoading || !character) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GameLayout>
    );
  }

  const initialCustomization: AvatarCustomization = {
    hairStyle: character.hair_style || "short",
    hairColor: character.hair_color || "#4a3728",
    eyeColor: character.eye_color || "#3b82f6",
    skinTone: character.skin_tone || "#e0ac69",
    faceStyle: character.face_style || "round",
    accessory: character.accessory || null,
  };

  const handleSave = async (customization: AvatarCustomization) => {
    try {
      await updateCharacter.mutateAsync({
        hair_style: customization.hairStyle,
        hair_color: customization.hairColor,
        eye_color: customization.eyeColor,
        skin_tone: customization.skinTone,
        face_style: customization.faceStyle,
        accessory: customization.accessory,
      });
      toast.success("Aparência salva com sucesso!");
      navigate("/character");
    } catch (error) {
      toast.error("Erro ao salvar aparência");
    }
  };

  return (
    <GameLayout>
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/character")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Personalizar Aparência</h1>
            <p className="text-muted-foreground text-sm">Customize a aparência do seu personagem</p>
          </div>
        </div>

        {/* Customizer */}
        <div className="bg-card border border-border rounded-xl p-6">
          <AvatarCustomizer
            initialCustomization={initialCustomization}
            onSave={handleSave}
            onCancel={() => navigate("/character")}
            isSaving={updateCharacter.isPending}
          />
        </div>
      </div>
    </GameLayout>
  );
}
