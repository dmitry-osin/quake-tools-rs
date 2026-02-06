let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function playTone(frequency: number, durationSeconds: number, volume: number, startDelaySeconds = 0): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  void context.resume();

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startAt = context.currentTime + startDelaySeconds;
  const endAt = startAt + durationSeconds;

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.01);
}

export function playStage1(volume: number): void {
  playTone(440, 0.12, volume);
}

export function playStage2(volume: number): void {
  playTone(660, 0.1, volume);
  playTone(660, 0.1, volume, 0.14);
}

export function playStage3(volume: number): void {
  playTone(880, 0.08, volume);
}
