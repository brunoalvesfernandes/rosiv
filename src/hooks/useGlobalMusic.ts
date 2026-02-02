import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { playMusic, stopMusic, isBgmEnabled, getCurrentUrl, isPlaying } from "@/utils/musicPlayer";

// Fetch the global music URL from area_music table (using 'global' area)
export function useGlobalMusic() {
  const location = useLocation();
  const hasTriedPlayRef = useRef(false);

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
    refetchOnMount: false, // IMPORTANT: Don't refetch when component remounts
    refetchOnReconnect: false,
  });

  // Public pages that shouldn't play music
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPage = publicPaths.includes(location.pathname);

  // Handle music - only on initial load and public/private transitions
  useEffect(() => {
    if (isLoading) return;

    // Stop music on public pages
    if (isPublicPage) {
      stopMusic();
      hasTriedPlayRef.current = false;
      return;
    }

    // Only try to start music if:
    // 1. We have a URL
    // 2. BGM is enabled
    // 3. We haven't already tried to play OR the current track is different
    // 4. Nothing is currently playing OR we need to switch tracks
    if (globalMusicUrl && isBgmEnabled()) {
      const currentUrl = getCurrentUrl();
      const currentlyPlaying = isPlaying();
      
      // Only play if we're not already playing this track
      if (currentUrl !== globalMusicUrl || !currentlyPlaying) {
        if (!hasTriedPlayRef.current || currentUrl !== globalMusicUrl) {
          playMusic(globalMusicUrl);
          hasTriedPlayRef.current = true;
        }
      }
    }
  }, [isPublicPage, globalMusicUrl, isLoading]);

  // Cleanup on unmount (only when leaving the app entirely)
  useEffect(() => {
    return () => {
      // Only stop if we're actually unmounting the entire app
      // Not just navigating between pages
    };
  }, []);

  return { globalMusicUrl, isLoading };
}
