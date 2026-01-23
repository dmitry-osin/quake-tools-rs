import { useTranslation } from "react-i18next";
import { ITEM_META } from "../data/gameData";
import { CheatSheet } from "../components/CheatSheet";
import { HotkeyInput } from "../components/HotkeyInput";
import { TimerCard } from "../components/TimerCard";
import type { Game, ItemConfig, ItemType, MapPreset } from "../types/domain";

type MainPageProps = {
  game: Game;
  presetId: string;
  customItemTypes: ItemType[];
  presets: MapPreset[];
  items: ItemConfig[];
  allItemTypes: ItemType[];
  onSelectGame: (game: Game) => void;
  onSelectPreset: (presetId: string) => void;
  onToggleCustomItem: (itemType: ItemType) => void;
};

export function MainPage({
  game,
  presetId,
  customItemTypes,
  presets,
  items,
  allItemTypes,
  onSelectGame,
  onSelectPreset,
  onToggleCustomItem,
}: MainPageProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <div className="panel">
        <h2 className="panel-title">{t("main.gameMode")}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={game === "QuakeLive" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSelectGame("QuakeLive")}
          >
            Quake Live
          </button>
          <button
            type="button"
            className={game === "QuakeChampions" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSelectGame("QuakeChampions")}
          >
            Quake Champions
          </button>
        </div>

        <label htmlFor="preset" className="mt-3 block text-xs uppercase tracking-[0.2em] text-[var(--t3)]">
          {t("main.mapPreset")}
        </label>
        <select
          id="preset"
          className="mt-1 w-full rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-2 text-sm"
          value={presetId}
          onChange={(event) => onSelectPreset(event.currentTarget.value)}
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
          <option value="custom">{t("main.customPreset")}</option>
        </select>

        {presetId === "custom" ? (
          <div className="mt-3">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--t3)]">{t("main.customItems")}</div>
            <div className="grid grid-cols-2 gap-2">
              {allItemTypes.map((itemType) => {
                const active = customItemTypes.includes(itemType);

                return (
                  <label
                    key={itemType}
                    className="flex items-center gap-2 rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => onToggleCustomItem(itemType)}
                    />
                    {ITEM_META[itemType].label}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="panel">
        <h2 className="panel-title">{t("main.hotkeys")}</h2>
        <div className="grid gap-2">
          {items.map((item) => (
            <HotkeyInput key={item.id} itemLabel={ITEM_META[item.itemType].label} hotkey={item.hotkey} />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        {items.map((item) => (
          <TimerCard
            key={item.id}
            label={ITEM_META[item.itemType].label}
            hotkey={item.hotkey}
            icon={ITEM_META[item.itemType].icon}
            color={ITEM_META[item.itemType].color}
            spawnSeconds={item.spawnSeconds}
          />
        ))}
      </div>

      <CheatSheet />
    </section>
  );
}
