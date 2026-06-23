import {
  buildItemsWithHotkeys,
  DEFAULT_HOTKEY_BY_ITEM,
  firstPresetId,
  getPresetsByGame,
  resolveItemTypes,
} from "../data/gameData";
import { isValidHotkey, normalizeHotkeyInput } from "../hotkeys/hotkeyUtils";
import type { AppSettings, AppState, Game, ItemConfig, ItemType, Page, Theme } from "../types/domain";

type Action =
  | { type: "set-page"; page: Page }
  | {
      type: "hydrate";
      payload: {
        game: Game;
        presetId: string;
        customItemTypes: ItemType[];
        hotkeysByItem: Record<ItemType, string>;
        items: ItemConfig[];
        settings: AppSettings;
      };
    }
  | { type: "set-nav-open"; open: boolean }
  | { type: "set-game"; game: Game }
  | { type: "set-preset"; presetId: string }
  | { type: "toggle-custom-item"; itemType: ItemType }
  | { type: "toggle-global-hook" }
  | { type: "set-global-hook"; active: boolean }
  | { type: "toggle-sound" }
  | { type: "toggle-developer-mode" }
  | { type: "set-guide-never-show-again"; value: boolean }
  | { type: "toggle-always-on-top" }
  | { type: "set-theme"; theme: Theme }
  | { type: "set-item-stage-threshold"; itemType: ItemType; stage: "stage1" | "stage2"; thresholdSeconds: number }
  | { type: "set-item-stage-color"; itemType: ItemType; stage: "stage1" | "stage2"; color: string }
  | { type: "set-item-volume"; itemType: ItemType; volume: number }
  | { type: "assign-hotkey"; itemId: string; hotkey: string }
  | { type: "clear-hotkey"; itemId: string }
  | { type: "clear-hotkey-conflict" }
  | { type: "set-display-mode"; displayMode: AppSettings["displayMode"] }
  | { type: "toggle-game-clock"; nowMs: number }
  | { type: "reset-game-clock" }
  | { type: "activate-item"; itemId: string; nowMs: number }
  | { type: "tick"; nowMs: number };

const defaultSettings: AppSettings = {
  theme: "Neon",
  developerMode: false,
  guideNeverShowAgain: false,
  idleColor: "#4b5563",
  itemAlerts: {
    MegaHealth: { stage1ThresholdSeconds: 15, stage2ThresholdSeconds: 10, stage1Color: "#f59e0b", stage2Color: "#ef4444", volume: 0.9 },
    RedArmor: { stage1ThresholdSeconds: 15, stage2ThresholdSeconds: 10, stage1Color: "#f59e0b", stage2Color: "#ef4444", volume: 0.9 },
    GreenArmor: { stage1ThresholdSeconds: 15, stage2ThresholdSeconds: 10, stage1Color: "#f59e0b", stage2Color: "#ef4444", volume: 0.9 },
    YellowArmor: { stage1ThresholdSeconds: 15, stage2ThresholdSeconds: 10, stage1Color: "#f59e0b", stage2Color: "#ef4444", volume: 0.9 },
    Health: { stage1ThresholdSeconds: 15, stage2ThresholdSeconds: 10, stage1Color: "#f59e0b", stage2Color: "#ef4444", volume: 0.9 },
  },
  soundEnabled: true,
  displayMode: "SpawnTime",
  alwaysOnTop: false,
  globalHookActive: false,
};

function clampThreshold(value: number): number {
  return Math.max(1, Math.floor(value));
}

const defaultCustomItemTypes: ItemType[] = [];
const defaultGame: Game = "QuakeLive";
const defaultPresetId = firstPresetId(defaultGame);

export const initialAppState: AppState = {
  page: "Main",
  navOpen: false,
  game: defaultGame,
  presetId: defaultPresetId,
  customItemTypes: defaultCustomItemTypes,
  hotkeysByItem: { ...DEFAULT_HOTKEY_BY_ITEM },
  items: buildItemsWithHotkeys(
    defaultGame,
    resolveItemTypes(defaultGame, defaultPresetId, defaultCustomItemTypes),
    DEFAULT_HOTKEY_BY_ITEM,
  ),
  timers: {},
  settings: defaultSettings,
  gameClockOffsetMs: 0,
  gameClockRunning: false,
  gameClockStartAt: null,
  hotkeyConflict: null,
};

function withItems(state: AppState, game: Game, presetId: string, customItemTypes: ItemType[]): AppState {
  const itemTypes = resolveItemTypes(game, presetId, customItemTypes);

  return {
    ...state,
    game,
    presetId,
    customItemTypes,
    items: buildItemsWithHotkeys(game, itemTypes, state.hotkeysByItem),
    timers: {},
  };
}

function getGameClockMs(state: AppState, nowMs: number): number {
  if (!state.gameClockRunning || state.gameClockStartAt === null) {
    return state.gameClockOffsetMs;
  }

  return state.gameClockOffsetMs + (nowMs - state.gameClockStartAt);
}

function getSpawnMsByItemId(state: AppState, itemId: string): number | null {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) {
    return null;
  }

  return item.spawnSeconds * 1000;
}

export function appReducer(state: AppState, action: Action): AppState {
  if (action.type === "hydrate") {
    const isValidPreset =
      action.payload.presetId === "custom" ||
      getPresetsByGame(action.payload.game).some((entry) => entry.id === action.payload.presetId);

    if (!isValidPreset) {
      return state;
    }

    return {
      ...state,
      game: action.payload.game,
      presetId: action.payload.presetId,
      customItemTypes: action.payload.customItemTypes,
      hotkeysByItem: action.payload.hotkeysByItem,
      items: buildItemsWithHotkeys(
        action.payload.game,
        resolveItemTypes(action.payload.game, action.payload.presetId, action.payload.customItemTypes),
        action.payload.hotkeysByItem,
      ),
      settings: action.payload.settings,
      timers: {},
      gameClockOffsetMs: 0,
      gameClockRunning: false,
      gameClockStartAt: null,
      hotkeyConflict: null,
    };
  }

  if (action.type === "set-page") {
    return { ...state, page: action.page };
  }

  if (action.type === "set-nav-open") {
    return { ...state, navOpen: action.open };
  }

  if (action.type === "set-game") {
    const nextPresetId = firstPresetId(action.game);
    return withItems(state, action.game, nextPresetId, state.customItemTypes);
  }

  if (action.type === "set-preset") {
    const isValidPreset = action.presetId === "custom" || getPresetsByGame(state.game).some((entry) => entry.id === action.presetId);
    if (!isValidPreset) {
      return state;
    }

    return withItems(state, state.game, action.presetId, state.customItemTypes);
  }

  if (action.type === "toggle-custom-item") {
    const hasItem = state.customItemTypes.includes(action.itemType);
    const nextCustomItems = hasItem
      ? state.customItemTypes.filter((itemType) => itemType !== action.itemType)
      : [...state.customItemTypes, action.itemType];

    if (state.presetId !== "custom") {
      return { ...state, customItemTypes: nextCustomItems };
    }

    return withItems(state, state.game, state.presetId, nextCustomItems);
  }

  if (action.type === "toggle-global-hook") {
    return {
      ...state,
      settings: {
        ...state.settings,
        globalHookActive: !state.settings.globalHookActive,
      },
    };
  }

  if (action.type === "set-global-hook") {
    return {
      ...state,
      settings: {
        ...state.settings,
        globalHookActive: action.active,
      },
    };
  }

  if (action.type === "toggle-sound") {
    return {
      ...state,
      settings: {
        ...state.settings,
        soundEnabled: !state.settings.soundEnabled,
      },
    };
  }

  if (action.type === "toggle-developer-mode") {
    return {
      ...state,
      settings: {
        ...state.settings,
        developerMode: !state.settings.developerMode,
      },
    };
  }

  if (action.type === "set-guide-never-show-again") {
    return {
      ...state,
      settings: {
        ...state.settings,
        guideNeverShowAgain: action.value,
      },
    };
  }

  if (action.type === "toggle-always-on-top") {
    return {
      ...state,
      settings: {
        ...state.settings,
        alwaysOnTop: !state.settings.alwaysOnTop,
      },
    };
  }

  if (action.type === "set-theme") {
    return {
      ...state,
      settings: {
        ...state.settings,
        theme: action.theme,
      },
    };
  }

  if (action.type === "set-item-stage-threshold") {
    const current = state.settings.itemAlerts[action.itemType];
    const raw = clampThreshold(action.thresholdSeconds);
    const nextStage1 = action.stage === "stage1" ? Math.max(raw, current.stage2ThresholdSeconds + 1) : current.stage1ThresholdSeconds;
    const nextStage2 = action.stage === "stage2" ? Math.min(raw, nextStage1 - 1) : current.stage2ThresholdSeconds;

    return {
      ...state,
      settings: {
        ...state.settings,
        itemAlerts: {
          ...state.settings.itemAlerts,
          [action.itemType]: {
            ...current,
            stage1ThresholdSeconds: nextStage1,
            stage2ThresholdSeconds: nextStage2,
          },
        },
      },
    };
  }

  if (action.type === "set-item-stage-color") {
    const current = state.settings.itemAlerts[action.itemType];

    return {
      ...state,
      settings: {
        ...state.settings,
        itemAlerts: {
          ...state.settings.itemAlerts,
          [action.itemType]: {
            ...current,
            stage1Color: action.stage === "stage1" ? action.color : current.stage1Color,
            stage2Color: action.stage === "stage2" ? action.color : current.stage2Color,
          },
        },
      },
    };
  }

  if (action.type === "set-item-volume") {
    const value = Math.max(0, Math.min(1, action.volume));
    const current = state.settings.itemAlerts[action.itemType];

    return {
      ...state,
      settings: {
        ...state.settings,
        itemAlerts: {
          ...state.settings.itemAlerts,
          [action.itemType]: {
            ...current,
            volume: value,
          },
        },
      },
    };
  }

  if (action.type === "assign-hotkey") {
    const normalized = normalizeHotkeyInput(action.hotkey);
    if (!isValidHotkey(normalized)) {
      return state;
    }

    const conflictEntry = (Object.keys(state.hotkeysByItem) as ItemType[]).find(
      (itemType) => itemType !== action.itemId && normalizeHotkeyInput(state.hotkeysByItem[itemType]) === normalized,
    );
    if (conflictEntry) {
      return {
        ...state,
        hotkeyConflict: {
          itemId: action.itemId,
          conflictsWith: conflictEntry,
        },
      };
    }

    const nextHotkeysByItem: Record<ItemType, string> = {
      ...state.hotkeysByItem,
      [action.itemId]: normalized,
    };

    const itemTypes = resolveItemTypes(state.game, state.presetId, state.customItemTypes);

    return {
      ...state,
      hotkeyConflict: null,
      hotkeysByItem: nextHotkeysByItem,
      items: buildItemsWithHotkeys(state.game, itemTypes, nextHotkeysByItem),
    };
  }

  if (action.type === "clear-hotkey") {
    const nextHotkeysByItem: Record<ItemType, string> = {
      ...state.hotkeysByItem,
      [action.itemId]: "",
    };
    const itemTypes = resolveItemTypes(state.game, state.presetId, state.customItemTypes);

    return {
      ...state,
      hotkeyConflict: null,
      hotkeysByItem: nextHotkeysByItem,
      items: buildItemsWithHotkeys(state.game, itemTypes, nextHotkeysByItem),
    };
  }

  if (action.type === "clear-hotkey-conflict") {
    return {
      ...state,
      hotkeyConflict: null,
    };
  }

  if (action.type === "set-display-mode") {
    return {
      ...state,
      settings: {
        ...state.settings,
        displayMode: action.displayMode,
      },
    };
  }

  if (action.type === "toggle-game-clock") {
    if (state.gameClockRunning) {
      return {
        ...state,
        gameClockOffsetMs: getGameClockMs(state, action.nowMs),
        gameClockRunning: false,
        gameClockStartAt: null,
      };
    }

    return {
      ...state,
      gameClockRunning: true,
      gameClockStartAt: action.nowMs,
    };
  }

  if (action.type === "reset-game-clock") {
    return {
      ...state,
      gameClockOffsetMs: 0,
      gameClockRunning: false,
      gameClockStartAt: null,
    };
  }

  if (action.type === "activate-item") {
    const spawnMs = getSpawnMsByItemId(state, action.itemId);
    if (!spawnMs) {
      return state;
    }

    const gameClockMs = getGameClockMs(state, action.nowMs);

    return {
      ...state,
      timers: {
        ...state.timers,
        [action.itemId]: {
          status: "Running",
          remainingMs: spawnMs,
          startedAtWallMs: action.nowMs,
          startedAtGameMs: gameClockMs,
          spawnAtGameMs: gameClockMs + spawnMs,
        },
      },
    };
  }

  if (action.type === "tick") {
    let changed = false;
    const nextTimers: AppState["timers"] = { ...state.timers };

    for (const itemId of Object.keys(state.timers)) {
      const timer = state.timers[itemId];
      if (timer.status !== "Running" || timer.startedAtWallMs === null) {
        continue;
      }

      const spawnMs = getSpawnMsByItemId(state, itemId);
      if (!spawnMs) {
        continue;
      }

      const elapsedMs = Math.max(0, action.nowMs - timer.startedAtWallMs);
      const remainingMs = Math.max(0, spawnMs - elapsedMs);

      if (remainingMs === 0) {
        nextTimers[itemId] = {
          ...timer,
          status: "Expired",
          remainingMs: 0,
        };
        changed = true;
        continue;
      }

      if (remainingMs !== timer.remainingMs) {
        nextTimers[itemId] = {
          ...timer,
          remainingMs,
        };
        changed = true;
      }
    }

    if (!changed) {
      return state;
    }

    return {
      ...state,
      timers: nextTimers,
    };
  }

  return state;
}

export function selectGameClockMs(state: AppState, nowMs: number): number {
  return getGameClockMs(state, nowMs);
}
