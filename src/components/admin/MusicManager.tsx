import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Upload, Trash2, Play, Pause, Volume2 } from "lucide-react";
import { useAreaMusic } from "@/hooks/useAreaMusic";
import { Slider } from "@/components/ui/slider";

export function MusicManager() {
  const { areaMusic, isLoading, uploadMusic, removeMusic } = useAreaMusic();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Find the global music entry
  const globalMusic = areaMusic?.find(a => a.area_name === "global");

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      return;
    }
    uploadMusic.mutate({ areaName: "global", file });
  };

  const handlePlay = (url: string) => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      audioRef.current.play();
      audioRef.current.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleRemove = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
    removeMusic.mutate("global");
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <Card className="bg-card/80 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Music className="h-5 w-5 text-primary" />
          Música do Jogo
        </CardTitle>
        <CardDescription>
          Configure a trilha sonora que toca em todas as páginas do jogo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Volume control */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Volume Preview:</span>
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

        {/* Music status */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-xl border border-primary/20">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Music className="w-7 h-7 text-primary" />
          </div>
          
          <div className="flex-1">
            <p className="font-display font-bold">Trilha Sonora Global</p>
            {globalMusic?.music_url ? (
              <p className="text-sm text-green-400 flex items-center gap-1">
                ✓ Música configurada
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma música configurada (silêncio)
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {globalMusic?.music_url && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => handlePlay(globalMusic.music_url!)}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleRemove}
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
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                  e.target.value = "";
                }
              }}
            />
            <Button
              variant="default"
              className="h-10"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMusic.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {globalMusic?.music_url ? "Trocar Música" : "Fazer Upload"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Formatos suportados: MP3, WAV, OGG, M4A. Máximo recomendado: 5MB.
          A música será reproduzida em loop em todas as páginas do jogo.
        </p>
      </CardContent>
    </Card>
  );
}
