import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ITEM_META } from "../data/gameData";
import { CheatSheet } from "../components/CheatSheet";
import { HotkeyInput } from "../components/HotkeyInput";
import { TimerCard } from "../components/TimerCard";
import type { DisplayMode, Game, ItemConfig, ItemType, MapPreset, TimerEntry } from "../types/domain";

type MainPageProps = {
  game: Game;
  presetId: string;
  customItemTypes: ItemType[];
  presets: MapPreset[];
  items: ItemConfig[];
  timers: Record<string, TimerEntry>;
  displayMode: DisplayMode;
  gameClockMs: number;
  gameClockRunning: boolean;
  allItemTypes: ItemType[];
  onSelectGame: (game: Game) => void;
  onSelectPreset: (presetId: string) => void;
  onToggleCustomItem: (itemType: ItemType) => void;
  onSetDisplayMode: (displayMode: DisplayMode) => void;
  onToggleGameClock: () => void;
  onResetGameClock: () => void;
  onActivateItem: (itemId: string) => void;
};

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatSpawnAt(ms: number): string {
  return formatClock(ms);
}

export function MainPage({
  game,
  presetId,
  customItemTypes,
  presets,
  items,
  timers,
  displayMode,
  gameClockMs,
  gameClockRunning,
  allItemTypes,
  onSelectGame,
  onSelectPreset,
  onToggleCustomItem,
  onSetDisplayMode,
  onToggleGameClock,
  onResetGameClock,
  onActivateItem,
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="panel-title mb-0">{t("main.gameClock")}</h2>
          <span className="text-sm font-semibold tabular-nums">{formatClock(gameClockMs)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="icon-button" type="button" onClick={onToggleGameClock} aria-label={t("main.toggleClockAria")}>
            {gameClockRunning ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="icon-button" type="button" onClick={onResetGameClock} aria-label={t("main.resetClockAria")}>
            <RotateCcw size={16} />
          </button>
          <span className="text-xs text-[var(--t3)]">{gameClockRunning ? t("main.clockRunning") : t("main.clockPaused")}</span>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t("main.displayMode")}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={displayMode === "SpawnTime" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSetDisplayMode("SpawnTime")}
          >
            {t("main.spawnTime")}
          </button>
          <button
            type="button"
            className={displayMode === "TimeRemaining" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSetDisplayMode("TimeRemaining")}
          >
            {t("main.timeRemaining")}
          </button>
        </div>
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
        {items.map((item) => {
          const timer = timers[item.id];
          const status = timer?.status ?? "Idle";
          const remainingMs = timer?.remainingMs ?? item.spawnSeconds * 1000;
          const progressPercent =
            status === "Running" ? Math.max(0, Math.min(100, (remainingMs / (item.spawnSeconds * 1000)) * 100)) : 0;
          const displayValue =
            status === "Idle"
              ? "--"
              : displayMode === "TimeRemaining"
                ? String(Math.ceil(remainingMs / 1000))
                : formatSpawnAt(timer?.spawnAtGameMs ?? gameClockMs);

          return (
            <TimerCard
              key={item.id}
              label={ITEM_META[item.itemType].label}
              hotkey={item.hotkey}
              icon={ITEM_META[item.itemType].icon}
              color={ITEM_META[item.itemType].color}
              spawnSeconds={item.spawnSeconds}
              status={status}
              displayValue={displayValue}
              progressPercent={progressPercent}
              onActivate={() => onActivateItem(item.id)}
            />
          );
        })}
      </div>

      <CheatSheet />
    </section>
  );
}
