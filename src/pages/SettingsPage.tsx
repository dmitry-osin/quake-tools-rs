import { useTranslation } from "react-i18next";
import { HotkeyInput } from "../components/HotkeyInput";
import { ITEM_META } from "../data/gameData";
import type { AppSettings, HotkeyConflict, ItemConfig, ItemType, Theme } from "../types/domain";

type SettingsPageProps = {
  settings: AppSettings;
  items: ItemConfig[];
  hotkeyConflict: HotkeyConflict | null;
  onSetTheme: (theme: Theme) => void;
  onToggleSound: () => void;
  onToggleDeveloperMode: () => void;
  onShowGuide: () => void;
  onEnableGuideOnStartup: () => void;
  onAssignHotkey: (itemId: string, hotkey: string) => void;
  onClearHotkey: (itemId: string) => void;
  onClearHotkeyConflict: () => void;
  onSetItemStageThreshold: (itemType: ItemType, stage: "stage1" | "stage2", thresholdSeconds: number) => void;
  onSetItemStageColor: (itemType: ItemType, stage: "stage1" | "stage2", color: string) => void;
  onSetItemVolume: (itemType: ItemType, volume: number) => void;
  onToggleAlwaysOnTop: () => void;
  onToggleGlobalHook: () => void;
};

const HOTKEY_ORDER: ItemType[] = ["MegaHealth", "RedArmor", "YellowArmor", "GreenArmor", "Health"];

export function SettingsPage({
  settings,
  items,
  hotkeyConflict,
  onSetTheme,
  onToggleSound,
  onToggleDeveloperMode,
  onShowGuide,
  onEnableGuideOnStartup,
  onAssignHotkey,
  onClearHotkey,
  onClearHotkeyConflict,
  onSetItemStageThreshold,
  onSetItemStageColor,
  onSetItemVolume,
  onToggleAlwaysOnTop,
  onToggleGlobalHook,
}: SettingsPageProps) {
  const { t } = useTranslation();
  const orderedItems = HOTKEY_ORDER.map((itemType) => items.find((item) => item.itemType === itemType)).filter(
    (item): item is ItemConfig => Boolean(item),
  );

  return (
    <section className="space-y-3">
      <section className="panel space-y-2">
        <h2 className="panel-title">{t("settings.theme")}</h2>
        <div className="flex gap-2">
          {(["Light", "Dark", "Neon"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              className={settings.theme === theme ? "nav-item nav-item-active" : "nav-item"}
              onClick={() => onSetTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("settings.sound")}</h2>
        <label className="flex items-center justify-between rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm">
          <span>{t("settings.globalSound")}</span>
          <input type="checkbox" checked={settings.soundEnabled} onChange={onToggleSound} />
        </label>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("settings.hotkeys")}</h2>
        {hotkeyConflict ? (
          <div className="mb-2 rounded border border-rose-700/80 bg-rose-950/30 px-2 py-1 text-xs text-rose-200" role="alert">
            {t("settings.hotkeyConflict")}: {hotkeyConflict.itemId} - {hotkeyConflict.conflictsWith}
            <button className="ml-2 underline" type="button" onClick={onClearHotkeyConflict}>
              {t("settings.dismiss")}
            </button>
          </div>
        ) : null}
        <div className="grid gap-2">
          {orderedItems.map((item) => (
            <HotkeyInput
              key={item.id}
              itemId={item.id}
              itemLabel={ITEM_META[item.itemType].label}
              hotkey={item.hotkey}
              onAssign={onAssignHotkey}
              onClear={onClearHotkey}
            />
          ))}
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("settings.itemAlerts")}</h2>
        {orderedItems.map((item) => {
          const itemAlert = settings.itemAlerts[item.itemType];

          return (
            <div key={item.itemType} className="space-y-2 rounded border border-[var(--border2)] bg-[var(--surface2)] p-2">
              <div className="text-sm font-medium">{ITEM_META[item.itemType].label}</div>
              <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
                <span>{t("settings.stage1Threshold")}</span>
                <input
                  type="number"
                  min={2}
                  value={itemAlert.stage1ThresholdSeconds}
                  onChange={(event) => onSetItemStageThreshold(item.itemType, "stage1", Number(event.currentTarget.value))}
                  className="w-20 rounded border border-[var(--border2)] bg-[var(--surface)] px-2 py-1"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
                <span>{t("settings.stage2Threshold")}</span>
                <input
                  type="number"
                  min={1}
                  value={itemAlert.stage2ThresholdSeconds}
                  onChange={(event) => onSetItemStageThreshold(item.itemType, "stage2", Number(event.currentTarget.value))}
                  className="w-20 rounded border border-[var(--border2)] bg-[var(--surface)] px-2 py-1"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
                <span>{t("settings.stage1Color")}</span>
                <input
                  type="color"
                  value={itemAlert.stage1Color}
                  onChange={(event) => onSetItemStageColor(item.itemType, "stage1", event.currentTarget.value)}
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
                <span>{t("settings.stage2Color")}</span>
                <input
                  type="color"
                  value={itemAlert.stage2Color}
                  onChange={(event) => onSetItemStageColor(item.itemType, "stage2", event.currentTarget.value)}
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
                <span>{t("settings.volume")}: {Math.round(itemAlert.volume * 100)}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(itemAlert.volume * 100)}
                  onChange={(event) => onSetItemVolume(item.itemType, Number(event.currentTarget.value) / 100)}
                />
              </label>
            </div>
          );
        })}
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("settings.window")}</h2>
        <label className="flex items-center justify-between rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm">
          <span>{t("settings.alwaysOnTop")}</span>
          <input type="checkbox" checked={settings.alwaysOnTop} onChange={onToggleAlwaysOnTop} />
        </label>
        <label className="flex items-center justify-between rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm">
          <span>{t("settings.globalHook")}</span>
          <input type="checkbox" checked={settings.globalHookActive} onChange={onToggleGlobalHook} />
        </label>
        <label className="flex items-center justify-between rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm">
          <span>{t("settings.developerMode")}</span>
          <input type="checkbox" checked={settings.developerMode} onChange={onToggleDeveloperMode} />
        </label>
        <div className="flex items-center justify-between rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm">
          <span>{settings.guideNeverShowAgain ? t("settings.guideDisabled") : t("settings.guideEnabled")}</span>
          <div className="flex items-center gap-2">
            {settings.guideNeverShowAgain ? (
              <button type="button" className="nav-item w-auto" onClick={onEnableGuideOnStartup}>
                {t("settings.enableGuideOnStartup")}
              </button>
            ) : null}
            <button type="button" className="nav-item w-auto" onClick={onShowGuide}>
              {t("settings.showGuide")}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
