import { Pause, Play, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ITEM_META } from "../data/gameData";
import { CheatSheet } from "../components/CheatSheet";
import { HotkeyInput } from "../components/HotkeyInput";
import { TimerCard } from "../components/TimerCard";
import type { AlertStageSettings, DisplayMode, Game, HotkeyConflict, ItemConfig, ItemType, MapPreset, TimerEntry } from "../types/domain";

type MainPageProps = {
  game: Game;
  presetId: string;
  customItemTypes: ItemType[];
  presets: MapPreset[];
  items: ItemConfig[];
  hotkeyConflict: HotkeyConflict | null;
  timers: Record<string, TimerEntry>;
  displayMode: DisplayMode;
  stage1: AlertStageSettings;
  stage2: AlertStageSettings;
  stage3: AlertStageSettings;
  gameClockMs: number;
  gameClockRunning: boolean;
  allItemTypes: ItemType[];
  onSelectGame: (game: Game) => void;
  onSelectPreset: (presetId: string) => void;
  onToggleCustomItem: (itemType: ItemType) => void;
  onSetDisplayMode: (displayMode: DisplayMode) => void;
  onAssignHotkey: (itemId: string, hotkey: string) => void;
  onClearHotkeyConflict: () => void;
  onToggleGameClock: () => void;
  onResetGameClock: () => void;
  onActivateItem: (itemId: string) => void;
};

type StageState = {
  color: string | null;
  effectClassName: string;
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

function resolveStageState(
  status: TimerEntry["status"],
  remainingMs: number,
  stage1: AlertStageSettings,
  stage2: AlertStageSettings,
  stage3: AlertStageSettings,
): StageState {
  if (status !== "Running") {
    return { color: null, effectClassName: "" };
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  if (remainingSeconds <= stage3.thresholdSeconds) {
    return { color: stage3.color, effectClassName: "timer-flash" };
  }

  if (remainingSeconds <= stage2.thresholdSeconds) {
    return { color: stage2.color, effectClassName: "timer-pulse-fast" };
  }

  if (remainingSeconds <= stage1.thresholdSeconds) {
    return { color: stage1.color, effectClassName: "timer-pulse-slow" };
  }

  return { color: null, effectClassName: "" };
}

export function MainPage({
  game,
  presetId,
  customItemTypes,
  presets,
  items,
  hotkeyConflict,
  timers,
  displayMode,
  stage1,
  stage2,
  stage3,
  gameClockMs,
  gameClockRunning,
  allItemTypes,
  onSelectGame,
  onSelectPreset,
  onToggleCustomItem,
  onSetDisplayMode,
  onAssignHotkey,
  onClearHotkeyConflict,
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
            {t("main.ql")}
          </button>
          <button
            type="button"
            className={game === "QuakeChampions" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSelectGame("QuakeChampions")}
          >
            {t("main.qc")}
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
        {displayMode === "SpawnTime" && !gameClockRunning ? (
          <div className="mb-2 text-xs text-amber-300">{t("main.spawnModeHint")}</div>
        ) : null}
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
        {hotkeyConflict ? (
          <div className="mb-2 rounded border border-rose-700/80 bg-rose-950/30 px-2 py-1 text-xs text-rose-200" role="alert">
            {t("main.hotkeyConflict")}: {hotkeyConflict.itemId} - {hotkeyConflict.conflictsWith}
            <button className="ml-2 underline" type="button" onClick={onClearHotkeyConflict}>
              {t("main.dismiss")}
            </button>
          </div>
        ) : null}
        <div className="grid gap-2">
          {items.map((item) => (
            <HotkeyInput
              key={item.id}
              itemId={item.id}
              itemLabel={ITEM_META[item.itemType].label}
              hotkey={item.hotkey}
              onAssign={onAssignHotkey}
            />
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
                : gameClockRunning
                  ? formatSpawnAt(timer?.spawnAtGameMs ?? gameClockMs)
                  : String(Math.ceil(remainingMs / 1000));
          const remainingLabel = status === "Idle" ? undefined : `${t("main.remainingShort")} ${Math.ceil(remainingMs / 1000)}s`;
          const stageState = resolveStageState(status, remainingMs, stage1, stage2, stage3);

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
              remainingLabel={remainingLabel}
              progressPercent={progressPercent}
              alertColor={stageState.color}
              effectClassName={stageState.effectClassName}
              onActivate={() => onActivateItem(item.id)}
            />
          );
        })}
      </div>

      <CheatSheet game={game} />
    </section>
  );
}
