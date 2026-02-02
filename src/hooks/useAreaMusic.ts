import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AreaMusic {
  id: string;
  area_name: string;
  area_label: string;
  music_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useAreaMusic() {
  const queryClient = useQueryClient();

  const { data: areaMusic, isLoading } = useQuery({
    queryKey: ["area_music"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("area_music")
        .select("*")
        .order("area_label");
      
      if (error) throw error;
      return data as AreaMusic[];
    },
  });

  const uploadMusic = useMutation({
    mutationFn: async ({ areaName, file }: { areaName: string; file: File }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${areaName}.${fileExt}`;
      
      // Delete existing file if any
      await supabase.storage.from("game-music").remove([fileName]);
      
      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("game-music")
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("game-music")
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase
        .from("area_music")
        .update({ music_url: urlData.publicUrl })
        .eq("area_name", areaName);
      
      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area_music"] });
      toast.success("Música atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao fazer upload: " + error.message);
    },
  });

  const removeMusic = useMutation({
    mutationFn: async (areaName: string) => {
      // Get current music to find file name
      const { data: current } = await supabase
        .from("area_music")
        .select("music_url")
        .eq("area_name", areaName)
        .single();

      if (current?.music_url) {
        // Extract filename from URL
        const url = new URL(current.music_url);
        const pathParts = url.pathname.split("/");
        const fileName = pathParts[pathParts.length - 1];
        
        // Delete from storage
        await supabase.storage.from("game-music").remove([fileName]);
      }

      // Clear URL in database
      const { error } = await supabase
        .from("area_music")
        .update({ music_url: null })
        .eq("area_name", areaName);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area_music"] });
      toast.success("Música removida!");
    },
    onError: (error) => {
      toast.error("Erro ao remover música: " + error.message);
    },
  });

  const getMusicForArea = (areaName: string): string | null => {
    const area = areaMusic?.find(a => a.area_name === areaName);
    return area?.music_url || null;
  };

  return {
    areaMusic,
    isLoading,
    uploadMusic,
    removeMusic,
    getMusicForArea,
  };
}
