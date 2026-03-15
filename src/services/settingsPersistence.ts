import { invoke } from "@tauri-apps/api/core";
import type { AppSettings, Game, ItemConfig, ItemType } from "../types/domain";

export type PersistedState = {
  game: Game;
  presetId: string;
  customItemTypes: ItemType[];
  items: ItemConfig[];
  settings: AppSettings;
};

export async function loadPersistedState(): Promise<PersistedState> {
  return invoke<PersistedState>("load_persisted_state");
}

export async function savePersistedState(payload: PersistedState): Promise<void> {
  await invoke("save_persisted_state", { payload });
}

export async function setAlwaysOnTop(value: boolean): Promise<void> {
  await invoke("set_always_on_top", { value });
}
