import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { playMusic, stopMusic, isBgmEnabled } from "@/utils/musicPlayer";

// Fetch the global music URL from area_music table (using 'global' area)
export function useGlobalMusic() {
  const location = useLocation();
  const hasStartedRef = useRef(false);

  const { data: globalMusicUrl, isLoading } = useQuery({
    queryKey: ["global-music"],
    queryFn: async () => {
      const { data } = await supabase
        .from("area_music")
        .select("music_url")
        .eq("area_name", "global")
        .single();

      return data?.music_url || null;
    },
  });

  // Public pages that shouldn't play music
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  useEffect(() => {
    if (isLoading) return;

    // Stop music on public pages
    if (isPublicPage) {
      stopMusic();
      hasStartedRef.current = false;
      return;
    }

    // Start music once when entering game pages
    if (!hasStartedRef.current && globalMusicUrl && isBgmEnabled()) {
      playMusic(globalMusicUrl);
      hasStartedRef.current = true;
    }
  }, [location.pathname, globalMusicUrl, isLoading, isPublicPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      hasStartedRef.current = false;
    };
  }, []);

  return { globalMusicUrl, isLoading };
}
