// Game audio system using Web Audio API
// Creates procedural game-themed sounds and background music

let audioContext: AudioContext | null = null;
let currentBgm: { gainNode: GainNode; oscillators: OscillatorNode[]; intervalId?: number } | null = null;
let bgmEnabled = true;
let sfxEnabled = true;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

// Initialize audio on first user interaction
export function initAudioOnInteraction() {
  const resume = () => {
    if (audioContext?.state === "suspended") {
      audioContext.resume();
    }
    document.removeEventListener("click", resume);
    document.removeEventListener("keydown", resume);
  };
  document.addEventListener("click", resume);
  document.addEventListener("keydown", resume);
}

// Volume controls
export function setBgmEnabled(enabled: boolean) {
  bgmEnabled = enabled;
  if (!enabled) {
    stopBgm();
  }
}

export function setSfxEnabled(enabled: boolean) {
  sfxEnabled = enabled;
}

export function isBgmEnabled() {
  return bgmEnabled;
}

export function isSfxEnabled() {
  return sfxEnabled;
}

// Stop current background music
export function stopBgm() {
  if (currentBgm) {
    currentBgm.gainNode.gain.exponentialRampToValueAtTime(0.001, getAudioContext().currentTime + 0.5);
    currentBgm.oscillators.forEach(osc => {
      try {
        osc.stop(getAudioContext().currentTime + 0.6);
      } catch (e) {
        // Already stopped
      }
    });
    currentBgm = null;
  }
}

// ========= SOUND EFFECTS =========

export function playMentionSound() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Distinct "ping" sound for mentions
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.log("Audio not available");
  }
}

export function playBattleHitSound() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Impact sound
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.log("Audio not available");
  }
}

export function playVictorySound() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 - victory fanfare
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);

      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch (error) {
    console.log("Audio not available");
  }
}

export function playDefeatSound() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sad descending tone
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.8);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.log("Audio not available");
  }
}

export function playMissionCompleteSound() {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [392, 440, 523.25]; // G4, A4, C5

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  } catch (error) {
    console.log("Audio not available");
  }
}

// ========= BACKGROUND MUSIC =========

interface MusicPattern {
  notes: number[];
  durations: number[];
  type: OscillatorType;
  volume: number;
  tempo: number;
}

function createMelodicLoop(pattern: MusicPattern, bassPattern?: MusicPattern) {
  if (!bgmEnabled) return;
  
  stopBgm();

  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(pattern.volume, ctx.currentTime);

    const oscillators: OscillatorNode[] = [];
    let noteIndex = 0;
    let bassIndex = 0;
    let isPlaying = true;

    function playMelodyNote() {
      if (!bgmEnabled || !currentBgm || !isPlaying) return;

      const freq = pattern.notes[noteIndex % pattern.notes.length];
      const duration = pattern.durations[noteIndex % pattern.durations.length];
      
      // Main melody oscillator
      const oscillator = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      // Add slight reverb effect with delay
      const delayNode = ctx.createDelay();
      delayNode.delayTime.value = 0.1;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.2;

      oscillator.connect(noteGain);
      noteGain.connect(masterGain);
      oscillator.connect(delayNode);
      delayNode.connect(delayGain);
      delayGain.connect(masterGain);

      oscillator.type = pattern.type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Add vibrato for warmth
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 5;
      vibratoGain.gain.value = 3;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibrato.start(ctx.currentTime);
      vibrato.stop(ctx.currentTime + duration / 1000);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.02);
      noteGain.gain.setValueAtTime(0.6, ctx.currentTime + duration / 2000);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);

      oscillators.push(oscillator);
      noteIndex++;

      setTimeout(playMelodyNote, duration);
    }

    function playBassNote() {
      if (!bgmEnabled || !currentBgm || !isPlaying || !bassPattern) return;

      const freq = bassPattern.notes[bassIndex % bassPattern.notes.length];
      const duration = bassPattern.durations[bassIndex % bassPattern.durations.length];
      
      const oscillator = ctx.createOscillator();
      const noteGain = ctx.createGain();

      oscillator.connect(noteGain);
      noteGain.connect(masterGain);

      oscillator.type = bassPattern.type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);

      oscillators.push(oscillator);
      bassIndex++;

      setTimeout(playBassNote, duration);
    }

    currentBgm = { gainNode: masterGain, oscillators };
    playMelodyNote();
    if (bassPattern) {
      setTimeout(playBassNote, pattern.tempo / 2);
    }
  } catch (error) {
    console.log("Background music not available");
  }
}

// Arena BGM - Epic battle theme with dramatic melody
export function playArenaBgm() {
  const melodyPattern: MusicPattern = {
    notes: [
      329.63, 392.00, 440.00, 392.00, // E4, G4, A4, G4
      329.63, 293.66, 329.63, 392.00, // E4, D4, E4, G4
      440.00, 493.88, 523.25, 493.88, // A4, B4, C5, B4
      440.00, 392.00, 329.63, 293.66, // A4, G4, E4, D4
    ],
    durations: [300, 300, 600, 300, 300, 300, 300, 600, 300, 300, 600, 300, 300, 300, 300, 600],
    type: "triangle",
    volume: 0.08,
    tempo: 300
  };

  const bassPattern: MusicPattern = {
    notes: [
      164.81, 164.81, 196.00, 196.00, // E3, E3, G3, G3
      220.00, 220.00, 196.00, 164.81, // A3, A3, G3, E3
    ],
    durations: [600, 600, 600, 600, 600, 600, 600, 600],
    type: "sine",
    volume: 0.06,
    tempo: 600
  };

  createMelodicLoop(melodyPattern, bassPattern);
}

// Dungeon BGM - Mysterious and tense atmosphere
export function playDungeonBgm() {
  const melodyPattern: MusicPattern = {
    notes: [
      220.00, 233.08, 220.00, 196.00, // A3, Bb3, A3, G3
      174.61, 196.00, 220.00, 207.65, // F3, G3, A3, Ab3
      220.00, 261.63, 246.94, 220.00, // A3, C4, B3, A3
      196.00, 174.61, 155.56, 146.83, // G3, F3, Eb3, D3
    ],
    durations: [500, 500, 500, 750, 500, 500, 500, 750, 500, 500, 500, 750, 500, 500, 500, 1000],
    type: "sine",
    volume: 0.06,
    tempo: 500
  };

  const bassPattern: MusicPattern = {
    notes: [
      110.00, 116.54, 110.00, 98.00, // A2, Bb2, A2, G2
      87.31, 98.00, 110.00, 103.83, // F2, G2, A2, Ab2
    ],
    durations: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
    type: "triangle",
    volume: 0.05,
    tempo: 1000
  };

  createMelodicLoop(melodyPattern, bassPattern);
}

// Mission BGM - Adventurous and uplifting
export function playMissionBgm() {
  const melodyPattern: MusicPattern = {
    notes: [
      261.63, 293.66, 329.63, 349.23, // C4, D4, E4, F4
      392.00, 349.23, 329.63, 293.66, // G4, F4, E4, D4
      329.63, 392.00, 440.00, 523.25, // E4, G4, A4, C5
      493.88, 440.00, 392.00, 329.63, // B4, A4, G4, E4
    ],
    durations: [250, 250, 250, 250, 500, 250, 250, 500, 250, 250, 250, 500, 250, 250, 250, 500],
    type: "triangle",
    volume: 0.07,
    tempo: 250
  };

  const bassPattern: MusicPattern = {
    notes: [
      130.81, 146.83, 164.81, 174.61, // C3, D3, E3, F3
      196.00, 174.61, 164.81, 130.81, // G3, F3, E3, C3
    ],
    durations: [500, 500, 500, 500, 500, 500, 500, 500],
    type: "sine",
    volume: 0.05,
    tempo: 500
  };

  createMelodicLoop(melodyPattern, bassPattern);
}

// Guild War BGM - Intense and heroic
export function playGuildWarBgm() {
  const melodyPattern: MusicPattern = {
    notes: [
      329.63, 440.00, 392.00, 329.63, // E4, A4, G4, E4
      493.88, 440.00, 523.25, 587.33, // B4, A4, C5, D5
      523.25, 493.88, 440.00, 392.00, // C5, B4, A4, G4
      440.00, 493.88, 523.25, 440.00, // A4, B4, C5, A4
    ],
    durations: [200, 200, 400, 200, 200, 200, 200, 600, 200, 200, 200, 400, 200, 200, 400, 400],
    type: "sawtooth",
    volume: 0.05,
    tempo: 200
  };

  const bassPattern: MusicPattern = {
    notes: [
      164.81, 220.00, 196.00, 164.81, // E3, A3, G3, E3
      246.94, 220.00, 261.63, 220.00, // B3, A3, C4, A3
    ],
    durations: [400, 400, 400, 400, 400, 400, 400, 400],
    type: "triangle",
    volume: 0.04,
    tempo: 400
  };

  createMelodicLoop(melodyPattern, bassPattern);
}
