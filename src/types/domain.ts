export type Game = "QuakeLive" | "QuakeChampions";

export type ItemType = "RedArmor" | "YellowArmor" | "GreenArmor" | "MegaHealth" | "Health";

export type DisplayMode = "TimeRemaining" | "SpawnTime";

export type Theme = "Light" | "Dark" | "Neon";

export type Page = "Timers" | "Trainer" | "CVars" | "Settings" | "About";

export type TimerStatus = "Idle" | "Running" | "Expired";

export interface ItemConfig {
  id: string;
  itemType: ItemType;
  spawnSeconds: number;
  hotkey: string;
}

export interface TimerEntry {
  status: TimerStatus;
  remainingMs: number;
  startedAtWallMs: number | null;
  startedAtGameMs: number | null;
  spawnAtGameMs: number | null;
}

export interface ItemAlertSettings {
  stage1ThresholdSeconds: number;
  stage2ThresholdSeconds: number;
  stage1Color: string;
  stage2Color: string;
  volume: number;
}

export interface AppSettings {
  theme: Theme;
  developerMode: boolean;
  guideNeverShowAgain: boolean;
  idleColor: string;
  itemAlerts: Record<ItemType, ItemAlertSettings>;
  soundEnabled: boolean;
  displayMode: DisplayMode;
  alwaysOnTop: boolean;
  globalHookActive: boolean;
}

export interface MapPreset {
  id: string;
  name: string;
  items: ItemType[];
}

export interface HotkeyConflict {
  itemId: string;
  conflictsWith: string;
}

export interface AppState {
  page: Page;
  navOpen: boolean;
  game: Game;
  presetId: string;
  customItemTypes: ItemType[];
  hotkeysByItem: Record<ItemType, string>;
  items: ItemConfig[];
  timers: Record<string, TimerEntry>;
  settings: AppSettings;
  gameClockOffsetMs: number;
  gameClockRunning: boolean;
  gameClockStartAt: number | null;
  hotkeyConflict: HotkeyConflict | null;
}
