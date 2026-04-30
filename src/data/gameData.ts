import type { Game, ItemConfig, ItemType, MapPreset } from "../types/domain";

export const ALL_ITEM_TYPES: ItemType[] = ["MegaHealth", "RedArmor", "GreenArmor", "YellowArmor", "Health"];

export const DEFAULT_HOTKEY_BY_ITEM: Record<ItemType, string> = {
  MegaHealth: "F1",
  RedArmor: "F2",
  YellowArmor: "F3",
  GreenArmor: "",
  Health: "",
};

export const ITEM_META: Record<ItemType, { label: string; color: string; icon: "armor" | "mega" | "health" }> = {
  RedArmor: { label: "Red Armor", color: "#e74c3c", icon: "armor" },
  YellowArmor: { label: "Yellow Armor", color: "#f39c12", icon: "armor" },
  GreenArmor: { label: "Green Armor", color: "#2ecc71", icon: "armor" },
  MegaHealth: { label: "Mega Health", color: "#9b59b6", icon: "mega" },
  Health: { label: "Health", color: "#3498db", icon: "health" },
};

const QL_ITEMS: ItemType[] = ["MegaHealth", "RedArmor", "YellowArmor"];
const QC_ITEMS: ItemType[] = ["MegaHealth", "RedArmor", "YellowArmor"];

export const QUAKE_LIVE_PRESETS: MapPreset[] = [
  { id: "aerowalk", name: "Aerowalk", items: QL_ITEMS },
  { id: "battleforged", name: "Battleforged", items: QL_ITEMS },
  { id: "blood-run", name: "Blood Run", items: QL_ITEMS },
  { id: "cure", name: "Cure", items: QL_ITEMS },
  { id: "furious-heights", name: "Furious Heights", items: QL_ITEMS },
  { id: "hektik", name: "Hektik", items: QL_ITEMS },
  { id: "lost-world", name: "Lost World", items: QL_ITEMS },
  { id: "sinister", name: "Sinister", items: QL_ITEMS },
  { id: "toxicity", name: "Toxicity", items: QL_ITEMS },
];

export const QUAKE_CHAMPIONS_PRESETS: MapPreset[] = [
  { id: "awoken", name: "Awoken", items: QC_ITEMS },
  { id: "blood-covenant", name: "Blood Covenant", items: QC_ITEMS },
  { id: "blood-run", name: "Blood Run", items: QC_ITEMS },
  { id: "burial-chamber", name: "Burial Chamber", items: QC_ITEMS },
  { id: "corrupted-keep", name: "Corrupted Keep", items: QC_ITEMS },
  { id: "deep-embrace", name: "Deep Embrace", items: QC_ITEMS },
  { id: "exile", name: "Exile", items: QC_ITEMS },
  { id: "insomnia", name: "Insomnia", items: QC_ITEMS },
  { id: "lockbox", name: "Lockbox", items: QC_ITEMS },
  { id: "molten-falls", name: "Molten Falls", items: QC_ITEMS },
  { id: "ruins-of-sarnath", name: "Ruins of Sarnath", items: QC_ITEMS },
  { id: "the-longest-yard", name: "The Longest Yard", items: ["RedArmor", "MegaHealth"] },
  { id: "vale-of-pnath", name: "Vale of Pnath", items: QC_ITEMS },
];

export function getPresetsByGame(game: Game): MapPreset[] {
  return game === "QuakeLive" ? QUAKE_LIVE_PRESETS : QUAKE_CHAMPIONS_PRESETS;
}

export function getSpawnSeconds(game: Game, itemType: ItemType): number {
  if (game === "QuakeChampions") {
    return 30;
  }

  if (itemType === "MegaHealth" || itemType === "Health") {
    return 35;
  }

  return 25;
}

export function buildItems(game: Game, itemTypes: ItemType[]): ItemConfig[] {
  return buildItemsWithHotkeys(game, itemTypes, DEFAULT_HOTKEY_BY_ITEM);
}

export function buildItemsWithHotkeys(
  game: Game,
  itemTypes: ItemType[],
  hotkeysByItem: Record<ItemType, string>,
): ItemConfig[] {
  return itemTypes.map((itemType) => ({
    id: itemType,
    itemType,
    spawnSeconds: getSpawnSeconds(game, itemType),
    hotkey: hotkeysByItem[itemType] ?? DEFAULT_HOTKEY_BY_ITEM[itemType],
  }));
}

export function firstPresetId(game: Game): string {
  return getPresetsByGame(game)[0]?.id ?? "custom";
}

export function resolveItemTypes(game: Game, presetId: string, customItemTypes: ItemType[]): ItemType[] {
  if (presetId === "custom") {
    return customItemTypes;
  }

  const preset = getPresetsByGame(game).find((entry) => entry.id === presetId);
  return preset?.items ?? [];
}
