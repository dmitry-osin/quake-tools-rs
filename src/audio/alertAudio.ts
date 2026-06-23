import goGreenAudio from "../assets/audio/go-green.mp3";
import goToHealthAudio from "../assets/audio/go-to-health.mp3";
import goToMegaAudio from "../assets/audio/go-to-mega.mp3";
import goToRedAudio from "../assets/audio/go-to-red.mp3";
import goToYellowAudio from "../assets/audio/go-to-yellow.mp3";
import greenReadyAudio from "../assets/audio/green-ready.mp3";
import greenSoonAudio from "../assets/audio/green-soon.mp3";
import greenTakenAudio from "../assets/audio/green-taken.mp3";
import healthReadyAudio from "../assets/audio/health-ready.mp3";
import healthSoonAudio from "../assets/audio/health-soon.mp3";
import healthTakenAudio from "../assets/audio/health-taken.mp3";
import megaReadyAudio from "../assets/audio/mega-ready.mp3";
import megaSoonAudio from "../assets/audio/mega-soon.mp3";
import megaTakenAudio from "../assets/audio/mega-taken.mp3";
import redReadyAudio from "../assets/audio/red-ready.mp3";
import redSoonAudio from "../assets/audio/red-soon.mp3";
import redTakenAudio from "../assets/audio/red-taken.mp3";
import yellowReadyAudio from "../assets/audio/yellow-ready.mp3";
import yellowSoonAudio from "../assets/audio/yellow-soon.mp3";
import yellowTakenAudio from "../assets/audio/yellow-taken.mp3";
import type { ItemType } from "../types/domain";

const takenAudioByItem: Record<ItemType, string> = {
  MegaHealth: megaTakenAudio,
  RedArmor: redTakenAudio,
  GreenArmor: greenTakenAudio,
  YellowArmor: yellowTakenAudio,
  Health: healthTakenAudio,
};

const readyAudioByItem: Record<ItemType, string> = {
  MegaHealth: megaReadyAudio,
  RedArmor: redReadyAudio,
  GreenArmor: greenReadyAudio,
  YellowArmor: yellowReadyAudio,
  Health: healthReadyAudio,
};

const soonAudioByItem: Record<ItemType, string> = {
  MegaHealth: megaSoonAudio,
  RedArmor: redSoonAudio,
  GreenArmor: greenSoonAudio,
  YellowArmor: yellowSoonAudio,
  Health: healthSoonAudio,
};

const goToAudioByItem: Record<ItemType, string> = {
  MegaHealth: goToMegaAudio,
  RedArmor: goToRedAudio,
  GreenArmor: goGreenAudio,
  YellowArmor: goToYellowAudio,
  Health: goToHealthAudio,
};

function playAudio(source: string, volume: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const audio = new Audio(source);
  audio.volume = Math.max(0, Math.min(1, volume));
  void audio.play().catch(() => {
    // Ignore autoplay restrictions and output device errors.
  });
}

export function playItemTaken(itemType: ItemType, volume: number): void {
  playAudio(takenAudioByItem[itemType], volume);
}

export function playItemReady(itemType: ItemType, volume: number): void {
  playAudio(readyAudioByItem[itemType], volume);
}

export function playItemSoon(itemType: ItemType, volume: number): void {
  playAudio(soonAudioByItem[itemType], volume);
}

export function playItemGoTo(itemType: ItemType, volume: number): void {
  playAudio(goToAudioByItem[itemType], volume);
}
