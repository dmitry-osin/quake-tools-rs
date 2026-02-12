import {
  buildItems,
  firstPresetId,
  getPresetsByGame,
  resolveItemTypes,
} from "../data/gameData";
import { isValidHotkey, normalizeHotkeyInput } from "../hotkeys/hotkeyUtils";
import type { AppSettings, AppState, Game, ItemType, Page } from "../types/domain";

type Action =
  | { type: "set-page"; page: Page }
  | { type: "set-nav-open"; open: boolean }
  | { type: "set-game"; game: Game }
  | { type: "set-preset"; presetId: string }
  | { type: "toggle-custom-item"; itemType: ItemType }
  | { type: "toggle-global-hook" }
  | { type: "set-global-hook"; active: boolean }
  | { type: "toggle-sound" }
  | { type: "toggle-always-on-top" }
  | { type: "toggle-stage-sound"; stage: "stage1" | "stage2" | "stage3" }
  | { type: "assign-hotkey"; itemId: string; hotkey: string }
  | { type: "clear-hotkey-conflict" }
  | { type: "set-display-mode"; displayMode: AppSettings["displayMode"] }
  | { type: "toggle-game-clock"; nowMs: number }
  | { type: "reset-game-clock" }
  | { type: "activate-item"; itemId: string; nowMs: number }
  | { type: "tick"; nowMs: number };

const defaultSettings: AppSettings = {
  theme: "Dark",
  idleColor: "#4b5563",
  stage1: { thresholdSeconds: 15, color: "#f59e0b", soundEnabled: true, volume: 0.8 },
  stage2: { thresholdSeconds: 10, color: "#ef4444", soundEnabled: true, volume: 0.9 },
  stage3: { thresholdSeconds: 7, color: "#ef4444", soundEnabled: true, volume: 1.0 },
  soundEnabled: true,
  displayMode: "SpawnTime",
  alwaysOnTop: false,
  globalHookActive: false,
};

const defaultCustomItemTypes: ItemType[] = [];
const defaultGame: Game = "QuakeLive";
const defaultPresetId = firstPresetId(defaultGame);

export const initialAppState: AppState = {
  page: "Main",
  navOpen: false,
  game: defaultGame,
  presetId: defaultPresetId,
  customItemTypes: defaultCustomItemTypes,
  items: buildItems(defaultGame, resolveItemTypes(defaultGame, defaultPresetId, defaultCustomItemTypes)),
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
    items: buildItems(game, itemTypes),
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

  if (action.type === "toggle-always-on-top") {
    return {
      ...state,
      settings: {
        ...state.settings,
        alwaysOnTop: !state.settings.alwaysOnTop,
      },
    };
  }

  if (action.type === "toggle-stage-sound") {
    return {
      ...state,
      settings: {
        ...state.settings,
        [action.stage]: {
          ...state.settings[action.stage],
          soundEnabled: !state.settings[action.stage].soundEnabled,
        },
      },
    };
  }

  if (action.type === "assign-hotkey") {
    const normalized = normalizeHotkeyInput(action.hotkey);
    if (!isValidHotkey(normalized)) {
      return state;
    }

    const conflict = state.items.find((entry) => entry.id !== action.itemId && normalizeHotkeyInput(entry.hotkey) === normalized);
    if (conflict) {
      return {
        ...state,
        hotkeyConflict: {
          itemId: action.itemId,
          conflictsWith: conflict.id,
        },
      };
    }

    return {
      ...state,
      hotkeyConflict: null,
      items: state.items.map((entry) =>
        entry.id === action.itemId
          ? {
              ...entry,
              hotkey: normalized,
            }
          : entry,
      ),
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

    const existing = state.timers[action.itemId];
    if (existing?.status === "Running") {
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
