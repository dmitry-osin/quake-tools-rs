import {
  buildItems,
  firstPresetId,
  getPresetsByGame,
  resolveItemTypes,
} from "../data/gameData";
import type { AppSettings, AppState, Game, ItemType, Page } from "../types/domain";

type Action =
  | { type: "set-page"; page: Page }
  | { type: "set-nav-open"; open: boolean }
  | { type: "set-game"; game: Game }
  | { type: "set-preset"; presetId: string }
  | { type: "toggle-custom-item"; itemType: ItemType };

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

  return state;
}
