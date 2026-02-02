import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAreaMusic } from "./useAreaMusic";
import { playMusic, stopMusic, isBgmEnabled } from "@/utils/musicPlayer";

// Map routes to area names
const routeToAreaMap: Record<string, string> = {
  "/arena": "arena",
  "/dungeons": "dungeon",
  "/missions": "mission",
  "/guild-wars": "guild_war",
  "/training": "training",
  "/pets": "pets",
  "/shop": "shop",
  "/crafting": "crafting",
  "/dashboard": "dashboard",
};

export function useMusicByRoute() {
  const location = useLocation();
  const { areaMusic, isLoading } = useAreaMusic();
  const currentAreaRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !areaMusic) return;

    // Determine current area from route
    const currentPath = location.pathname;
    const areaName = routeToAreaMap[currentPath];

    // If no matching area, stop music
    if (!areaName) {
      if (currentAreaRef.current !== null) {
        stopMusic();
        currentAreaRef.current = null;
      }
      return;
    }

    // If same area, don't restart music
    if (areaName === currentAreaRef.current) {
      return;
    }

    // Get music URL for this area
    const area = areaMusic.find(a => a.area_name === areaName);
    const musicUrl = area?.music_url || null;

    // Update current area
    currentAreaRef.current = areaName;

    // Play music (or silence if no URL)
    if (isBgmEnabled()) {
      playMusic(musicUrl);
    }
  }, [location.pathname, areaMusic, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);
}
