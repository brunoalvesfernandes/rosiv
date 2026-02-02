import { useState } from "react";
import { PixelAvatar } from "./PixelAvatar";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarOptions, AvatarOption } from "@/data/avatars";

interface PixelAvatarCustomizerProps {
  initialAvatarId: string;
  characterClass?: "warrior" | "mage" | "archer";
  onSave: (avatarId: string) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function PixelAvatarCustomizer({ 
  initialAvatarId, 
  characterClass = "warrior",
  onSave, 
  onCancel,
  isSaving = false 
}: PixelAvatarCustomizerProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId || avatarOptions[0].id);
  const [filterClass, setFilterClass] = useState<"all" | "warrior" | "mage" | "archer">("all");

  const filteredAvatars = filterClass === "all" 
    ? avatarOptions 
    : avatarOptions.filter(a => a.class === filterClass);

  const selectedAvatar = avatarOptions.find(a => a.id === selectedAvatarId);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <PixelAvatar avatarId={selectedAvatarId} size="xl" />
        {selectedAvatar && (
          <div className="text-center">
            <h3 className="font-display text-lg font-bold">{selectedAvatar.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedAvatar.description}</p>
          </div>
        )}
      </div>

      {/* Class Filter */}
      <div className="flex justify-center gap-2">
        {(["all", "warrior", "mage"] as const).map((cls) => (
          <Button
            key={cls}
            variant={filterClass === cls ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterClass(cls)}
          >
            {cls === "all" ? "Todos" : cls === "warrior" ? "Guerreiros" : cls === "mage" ? "Magos" : "Arqueiros"}
          </Button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="bg-secondary/30 rounded-xl p-4">
        <div className="grid grid-cols-4 gap-3">
          {filteredAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatarId(avatar.id)}
              className={cn(
                "relative rounded-xl p-1 transition-all hover:scale-105",
                selectedAvatarId === avatar.id 
                  ? "ring-2 ring-primary bg-primary/20" 
                  : "hover:bg-secondary"
              )}
            >
              <PixelAvatar avatarId={avatar.id} size="md" />
              {selectedAvatarId === avatar.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button 
          onClick={() => onSave(selectedAvatarId)} 
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
