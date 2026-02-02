// Game audio system using Web Audio API
// Creates procedural game-themed sounds and background music

let audioContext: AudioContext | null = null;
let currentBgm: { gainNode: GainNode; oscillators: OscillatorNode[] } | null = null;
let bgmEnabled = true;
let sfxEnabled = true;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
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

function createBackgroundLoop(
  frequencies: number[],
  tempoMs: number,
  type: OscillatorType = "sine",
  volume: number = 0.08
) {
  if (!bgmEnabled) return;
  
  stopBgm();

  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);

    const oscillators: OscillatorNode[] = [];
    let noteIndex = 0;

    function playNextNote() {
      if (!bgmEnabled || !currentBgm) return;

      const freq = frequencies[noteIndex % frequencies.length];
      const oscillator = ctx.createOscillator();
      const noteGain = ctx.createGain();

      oscillator.connect(noteGain);
      noteGain.connect(masterGain);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (tempoMs / 1000) * 0.9);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + (tempoMs / 1000));

      oscillators.push(oscillator);
      noteIndex++;

      setTimeout(playNextNote, tempoMs);
    }

    currentBgm = { gainNode: masterGain, oscillators };
    playNextNote();
  } catch (error) {
    console.log("Background music not available");
  }
}

// Arena BGM - Tense, battle-ready theme
export function playArenaBgm() {
  const arenaScale = [
    196.00, // G3
    220.00, // A3
    246.94, // B3
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
  ];
  createBackgroundLoop(arenaScale, 300, "sawtooth", 0.06);
}

// Dungeon BGM - Dark, mysterious theme
export function playDungeonBgm() {
  const dungeonScale = [
    130.81, // C3
    146.83, // D3
    155.56, // Eb3
    174.61, // F3
    196.00, // G3
    207.65, // Ab3
    233.08, // Bb3
    261.63, // C4
  ];
  createBackgroundLoop(dungeonScale, 500, "triangle", 0.05);
}

// Mission BGM - Adventurous theme
export function playMissionBgm() {
  const missionScale = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25, // C5
  ];
  createBackgroundLoop(missionScale, 400, "sine", 0.07);
}

// Guild War BGM - Epic, intense theme
export function playGuildWarBgm() {
  const warScale = [
    164.81, // E3
    196.00, // G3
    220.00, // A3
    246.94, // B3
    329.63, // E4
    392.00, // G4
    440.00, // A4
    493.88, // B4
  ];
  createBackgroundLoop(warScale, 250, "square", 0.04);
}
