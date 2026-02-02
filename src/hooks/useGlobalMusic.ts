import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { playMusic, stopMusic, isBgmEnabled, getCurrentUrl } from "@/utils/musicPlayer";

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
    staleTime: Infinity, // Don't refetch on every navigation
    refetchOnWindowFocus: false,
  });

  // Public pages that shouldn't play music
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // Handle music on public/private page transitions
  useEffect(() => {
    if (isLoading) return;

    // Stop music on public pages
    if (isPublicPage) {
      stopMusic();
      hasStartedRef.current = false;
      return;
    }

    // Start music once when entering game pages (if not already playing same track)
    if (globalMusicUrl && isBgmEnabled()) {
      // Only play if not already playing this URL
      if (getCurrentUrl() !== globalMusicUrl) {
        playMusic(globalMusicUrl);
      }
      hasStartedRef.current = true;
    }
  }, [isPublicPage, globalMusicUrl, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      hasStartedRef.current = false;
    };
  }, []);

  return { globalMusicUrl, isLoading };
}
