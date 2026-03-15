import { useTranslation } from "react-i18next";
import type { AppSettings, Theme } from "../types/domain";

type SettingsPageProps = {
  settings: AppSettings;
  onSetTheme: (theme: Theme) => void;
  onSetDisplayMode: (mode: AppSettings["displayMode"]) => void;
  onToggleSound: () => void;
  onToggleStageSound: (stage: "stage1" | "stage2" | "stage3") => void;
  onSetStageThreshold: (stage: "stage1" | "stage2" | "stage3", thresholdSeconds: number) => void;
  onSetStageColor: (stage: "stage1" | "stage2" | "stage3", color: string) => void;
  onSetStageVolume: (stage: "stage1" | "stage2" | "stage3", volume: number) => void;
  onToggleAlwaysOnTop: () => void;
  onToggleGlobalHook: () => void;
};

export function SettingsPage({
  settings,
  onSetTheme,
  onSetDisplayMode,
  onToggleSound,
  onToggleStageSound,
  onSetStageThreshold,
  onSetStageColor,
  onSetStageVolume,
  onToggleAlwaysOnTop,
  onToggleGlobalHook,
}: SettingsPageProps) {
  const { t } = useTranslation();

  const stageEntries = [
    { key: "stage1", value: settings.stage1, label: t("settings.stage1") },
    { key: "stage2", value: settings.stage2, label: t("settings.stage2") },
    { key: "stage3", value: settings.stage3, label: t("settings.stage3") },
  ] as const;

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
        <h2 className="panel-title">{t("settings.displayMode")}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={settings.displayMode === "SpawnTime" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSetDisplayMode("SpawnTime")}
          >
            {t("settings.spawnTime")}
          </button>
          <button
            type="button"
            className={settings.displayMode === "TimeRemaining" ? "nav-item nav-item-active" : "nav-item"}
            onClick={() => onSetDisplayMode("TimeRemaining")}
          >
            {t("settings.timeRemaining")}
          </button>
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
        <h2 className="panel-title">{t("settings.alertStages")}</h2>
        {stageEntries.map((stage) => (
          <div key={stage.key} className="space-y-2 rounded border border-[var(--border2)] bg-[var(--surface2)] p-2">
            <div className="text-sm font-medium">{stage.label}</div>
            <label className="flex items-center justify-between text-xs text-[var(--t2)]">
              <span>{t("settings.stageSound")}</span>
              <input type="checkbox" checked={stage.value.soundEnabled} onChange={() => onToggleStageSound(stage.key)} />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
              <span>{t("settings.threshold")}</span>
              <input
                type="number"
                min={1}
                value={stage.value.thresholdSeconds}
                onChange={(event) => onSetStageThreshold(stage.key, Number(event.currentTarget.value))}
                className="w-20 rounded border border-[var(--border2)] bg-[var(--surface)] px-2 py-1"
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
              <span>{t("settings.color")}</span>
              <input type="color" value={stage.value.color} onChange={(event) => onSetStageColor(stage.key, event.currentTarget.value)} />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-[var(--t2)]">
              <span>{t("settings.volume")}: {Math.round(stage.value.volume * 100)}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(stage.value.volume * 100)}
                onChange={(event) => onSetStageVolume(stage.key, Number(event.currentTarget.value) / 100)}
              />
            </label>
          </div>
        ))}
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
      </section>
    </section>
  );
}
