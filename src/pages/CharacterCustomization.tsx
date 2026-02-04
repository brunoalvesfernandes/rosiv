import { GameLayout } from "@/components/layout/GameLayout";
import { PixelAvatarCustomizer } from "@/components/game/PixelAvatarCustomizer";
import { useCharacter, useUpdateCharacter } from "@/hooks/useCharacter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { avatarOptions } from "@/data/avatars";

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

  const handleSave = async (avatarId: string) => {
    try {
      await updateCharacter.mutateAsync({
        avatar_id: avatarId,
      });
      toast.success("Avatar salvo com sucesso!");
      navigate("/character");
    } catch (error) {
      toast.error("Erro ao salvar avatar");
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
          <PixelAvatarCustomizer
            initialAvatarId={character.avatar_id || avatarOptions[0].id}
            characterClass={character.class}
            onSave={handleSave}
            onCancel={() => navigate("/character")}
            isSaving={updateCharacter.isPending}
          />
        </div>
      </div>
    </GameLayout>
  );
}
