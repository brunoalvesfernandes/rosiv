import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Upload, Trash2, Play, Pause, Volume2 } from "lucide-react";
import { useAreaMusic } from "@/hooks/useAreaMusic";
import { Slider } from "@/components/ui/slider";

export function MusicManager() {
  const { areaMusic, isLoading, uploadMusic, removeMusic } = useAreaMusic();
  const [playingArea, setPlayingArea] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = async (areaName: string, file: File) => {
    if (!file.type.startsWith("audio/")) {
      return;
    }
    uploadMusic.mutate({ areaName, file });
  };

  const handlePlay = (areaName: string, url: string) => {
    if (playingArea === areaName) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingArea(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingArea(null);
      setPlayingArea(areaName);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleRemove = (areaName: string) => {
    if (playingArea === areaName) {
      audioRef.current?.pause();
      setPlayingArea(null);
    }
    removeMusic.mutate(areaName);
  };

  const areaIcons: Record<string, string> = {
    arena: "⚔️",
    dungeon: "🏰",
    mission: "📜",
    guild_war: "🛡️",
    training: "💪",
    pets: "🐾",
    shop: "🛒",
    crafting: "🔨",
    dashboard: "🏠",
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card className="bg-card/80 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5 text-primary" />
          Gerenciar Músicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Preview:</span>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            className="flex-1 max-w-32"
          />
          <span className="text-xs text-muted-foreground w-8">{Math.round(volume * 100)}%</span>
        </div>

        <div className="grid gap-3">
          {areaMusic?.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/50"
            >
              <span className="text-xl" title={area.area_name}>
                {areaIcons[area.area_name] || "🎵"}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{area.area_label}</p>
                {area.music_url ? (
                  <p className="text-xs text-muted-foreground truncate">
                    Música configurada ✓
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem música (silêncio)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {area.music_url && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePlay(area.area_name, area.music_url!)}
                    >
                      {playingArea === area.area_name ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(area.area_name)}
                      disabled={removeMusic.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[area.area_name] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(area.area_name, file);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => fileInputRefs.current[area.area_name]?.click()}
                  disabled={uploadMusic.isPending}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {area.music_url ? "Trocar" : "Upload"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Formatos suportados: MP3, WAV, OGG, M4A. Máximo recomendado: 5MB por arquivo.
        </p>
      </CardContent>
    </Card>
  );
}
