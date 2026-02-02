// Music player for custom audio files
// Replaces procedural Web Audio API music with uploaded audio files

let currentAudio: HTMLAudioElement | null = null;
let bgmEnabled = true;
let currentVolume = 0.3;

export function setBgmEnabled(enabled: boolean) {
  bgmEnabled = enabled;
  if (!enabled) {
    stopMusic();
  }
}

export function isBgmEnabled() {
  return bgmEnabled;
}

export function setVolume(volume: number) {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (currentAudio) {
    currentAudio.volume = currentVolume;
  }
}

export function getVolume() {
  return currentVolume;
}

export function playMusic(url: string | null) {
  // Stop any currently playing music
  stopMusic();

  // If no URL or BGM disabled, don't play anything (silence fallback)
  if (!url || !bgmEnabled) {
    return;
  }

  try {
    currentAudio = new Audio(url);
    currentAudio.loop = true;
    currentAudio.volume = currentVolume;
    
    currentAudio.play().catch(error => {
      console.log("Music autoplay blocked, waiting for user interaction");
      
      // Wait for user interaction to play
      const playOnInteraction = () => {
        if (currentAudio) {
          currentAudio.play().catch(() => {});
        }
        document.removeEventListener("click", playOnInteraction);
        document.removeEventListener("keydown", playOnInteraction);
      };
      
      document.addEventListener("click", playOnInteraction);
      document.addEventListener("keydown", playOnInteraction);
    });
  } catch (error) {
    console.log("Error playing music:", error);
  }
}

export function stopMusic() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function pauseMusic() {
  if (currentAudio) {
    currentAudio.pause();
  }
}

export function resumeMusic() {
  if (currentAudio && bgmEnabled) {
    currentAudio.play().catch(() => {});
  }
}

export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
