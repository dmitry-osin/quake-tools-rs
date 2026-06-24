import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { Circle, Power } from "lucide-react";
import { playItemGoTo, playItemReady, playItemSoon, playItemTaken } from "../audio/alertAudio";
import { ALL_ITEM_TYPES, buildItemsWithHotkeys, getPresetsByGame } from "../data/gameData";
import { eventToHotkey, isValidHotkey, normalizeHotkeyInput, toPluginHotkey } from "../hotkeys/hotkeyUtils";
import { loadPersistedState, savePersistedState, setAlwaysOnTop } from "../services/settingsPersistence";
import { GuideModal } from "../components/GuideModal";
import { NavigationDrawer } from "../components/NavigationDrawer";
import { TitleBar } from "../components/TitleBar";
import { AboutPage } from "../pages/AboutPage";
import { MainPage } from "../pages/MainPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TrainerPage } from "../pages/TrainerPage";
import { appReducer, initialAppState, selectGameClockMs } from "../state/appState";
import type { Game, TimerStatus } from "../types/domain";

export function AppShell() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [globalHookError, setGlobalHookError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const previousSecondsRef = useRef<Record<string, number>>({});
  const previousStatusRef = useRef<Record<string, TimerStatus>>({});

  function activateItemWithSound(itemId: string, now: number): void {
    const item = state.items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    if (state.settings.soundEnabled) {
      playItemTaken(item.itemType, state.settings.itemAlerts[item.itemType].volume);
    }

    dispatch({ type: "activate-item", itemId, nowMs: now });
  }

  useEffect(() => {
    void (async () => {
      try {
        const persisted = await loadPersistedState();
        dispatch({ type: "hydrate", payload: persisted });
      } catch {
        // Ignore and keep defaults.
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    if (!state.settings.developerMode) {
      document.body.classList.add("release-locked");
      window.addEventListener("contextmenu", preventContextMenu);
    }

    return () => {
      document.body.classList.remove("release-locked");
      window.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [state.settings.developerMode]);

  useEffect(() => {
    const theme = state.settings.theme.toLowerCase();
    document.documentElement.setAttribute("data-theme", theme);
  }, [state.settings.theme]);

  useEffect(() => {
    void setAlwaysOnTop(state.settings.alwaysOnTop);
  }, [state.settings.alwaysOnTop]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!state.settings.guideNeverShowAgain) {
      setGuideOpen(true);
    }
  }, [hydrated, state.settings.guideNeverShowAgain]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void savePersistedState({
        game: state.game,
        presetId: state.presetId,
        customItemTypes: state.customItemTypes,
        hotkeysByItem: state.hotkeysByItem,
        items: state.items,
        settings: state.settings,
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [hydrated, state.customItemTypes, state.game, state.hotkeysByItem, state.items, state.presetId, state.settings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      dispatch({ type: "tick", nowMs: now });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const nextSeconds: Record<string, number> = {};

    const nextStatus: Record<string, TimerStatus> = {};

    for (const item of state.items) {
      const timer = state.timers[item.id];
      if (!timer) {
        continue;
      }

      nextStatus[item.id] = timer.status;

      if (state.settings.soundEnabled && timer.status === "Expired" && previousStatusRef.current[item.id] === "Running") {
        playItemReady(item.itemType, state.settings.itemAlerts[item.itemType].volume);
      }

      if (timer.status !== "Running") {
        continue;
      }

      const currentSeconds = Math.max(0, Math.ceil(timer.remainingMs / 1000));
      const previousSeconds = previousSecondsRef.current[item.id];
      const itemAlert = state.settings.itemAlerts[item.itemType];

      if (
        state.settings.soundEnabled &&
        previousSeconds !== undefined &&
        previousSeconds !== currentSeconds
      ) {
        if (previousSeconds > itemAlert.stage1ThresholdSeconds && currentSeconds <= itemAlert.stage1ThresholdSeconds) {
          playItemSoon(item.itemType, itemAlert.volume);
        }

        if (previousSeconds > itemAlert.stage2ThresholdSeconds && currentSeconds <= itemAlert.stage2ThresholdSeconds) {
          playItemGoTo(item.itemType, itemAlert.volume);
        }
      }

      nextSeconds[item.id] = currentSeconds;
    }

    previousSecondsRef.current = nextSeconds;
    previousStatusRef.current = nextStatus;
  }, [state.items, state.settings, state.timers]);

  useEffect(() => {
    let active = true;

    async function syncGlobalShortcuts(): Promise<void> {
      try {
        await unregisterAll();
      } catch {
        if (active) {
          setGlobalHookError(t("main.globalHookDenied"));
          dispatch({ type: "set-global-hook", active: false });
        }
        return;
      }

      if (!state.settings.globalHookActive) {
        setGlobalHookError(null);
        return;
      }

      if (state.page !== "Main") {
        return;
      }

      try {
        for (const item of state.items) {
          const normalized = normalizeHotkeyInput(item.hotkey);
          if (!isValidHotkey(normalized)) {
            continue;
          }

          await register(toPluginHotkey(item.hotkey), () => {
            if (state.page !== "Main") {
              return;
            }

            activateItemWithSound(item.id, Date.now());
          });
        }

        if (active) {
          setGlobalHookError(null);
        }
      } catch {
        if (active) {
          setGlobalHookError(t("main.globalHookDenied"));
          dispatch({ type: "set-global-hook", active: false });
        }
      }
    }

    void syncGlobalShortcuts();

    return () => {
      active = false;
      void unregisterAll();
    };
  }, [state.items, state.page, state.settings.globalHookActive, state.settings.itemAlerts, state.settings.soundEnabled, t]);

  useEffect(() => {
    if (state.settings.globalHookActive && !globalHookError) {
      return;
    }

    const listener = (event: KeyboardEvent) => {
      if (state.page !== "Main") {
        return;
      }

      const element = event.target as HTMLElement | null;
      if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.getAttribute("contenteditable") === "true")) {
        return;
      }

      const pressed = normalizeHotkeyInput(eventToHotkey(event));
      if (!pressed) {
        return;
      }

      const item = state.items.find((entry) => normalizeHotkeyInput(entry.hotkey) === pressed);
      if (!item) {
        return;
      }

      event.preventDefault();
      activateItemWithSound(item.id, Date.now());
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [globalHookError, state.items, state.page, state.settings.globalHookActive, state.settings.itemAlerts, state.settings.soundEnabled]);

  useEffect(() => {
    const blockFindNext = (event: KeyboardEvent) => {
      if (event.key !== "F3") {
        return;
      }

      if (document.body.dataset.hotkeyCaptureActive === "true") {
        return;
      }

      event.preventDefault();

      const fallbackActive = !state.settings.globalHookActive || Boolean(globalHookError);
      if (!fallbackActive || state.page !== "Main") {
        return;
      }

      const item = state.items.find((entry) => normalizeHotkeyInput(entry.hotkey) === "F3");
      if (!item) {
        return;
      }

      event.stopPropagation();
      activateItemWithSound(item.id, Date.now());
    };

    window.addEventListener("keydown", blockFindNext, true);
    return () => window.removeEventListener("keydown", blockFindNext, true);
  }, [globalHookError, state.items, state.page, state.settings.globalHookActive, state.settings.itemAlerts, state.settings.soundEnabled]);

  const presets = useMemo(() => getPresetsByGame(state.game), [state.game]);
  const gameClockMs = useMemo(() => selectGameClockMs(state, nowMs), [nowMs, state]);

  const pageNode = useMemo(() => {
    if (state.page === "Trainer") {
      return <TrainerPage game={state.game} />;
    }

    if (state.page === "Settings") {
      return (
        <SettingsPage
          settings={state.settings}
          items={buildItemsWithHotkeys(state.game, ALL_ITEM_TYPES, state.hotkeysByItem)}
          hotkeyConflict={state.hotkeyConflict}
          onSetTheme={(theme) => dispatch({ type: "set-theme", theme })}
          onToggleSound={() => dispatch({ type: "toggle-sound" })}
          onToggleDeveloperMode={() => dispatch({ type: "toggle-developer-mode" })}
          onShowGuide={() => setGuideOpen(true)}
          onEnableGuideOnStartup={() => dispatch({ type: "set-guide-never-show-again", value: false })}
          onAssignHotkey={(itemId, hotkey) => dispatch({ type: "assign-hotkey", itemId, hotkey })}
          onClearHotkey={(itemId) => dispatch({ type: "clear-hotkey", itemId })}
          onClearHotkeyConflict={() => dispatch({ type: "clear-hotkey-conflict" })}
          onSetItemStageThreshold={(itemType, stage, thresholdSeconds) =>
            dispatch({ type: "set-item-stage-threshold", itemType, stage, thresholdSeconds })
          }
          onSetItemStageColor={(itemType, stage, color) => dispatch({ type: "set-item-stage-color", itemType, stage, color })}
          onSetItemVolume={(itemType, volume) => dispatch({ type: "set-item-volume", itemType, volume })}
          onToggleAlwaysOnTop={() => dispatch({ type: "toggle-always-on-top" })}
          onToggleGlobalHook={() => dispatch({ type: "toggle-global-hook" })}
        />
      );
    }

    if (state.page === "About") {
      return <AboutPage />;
    }

    return (
      <MainPage
        game={state.game}
        presetId={state.presetId}
        customItemTypes={state.customItemTypes}
        presets={presets}
        items={state.items}
        allItemTypes={ALL_ITEM_TYPES}
        onSelectGame={(game: Game) => dispatch({ type: "set-game", game })}
        onSelectPreset={(presetId) => dispatch({ type: "set-preset", presetId })}
        onToggleCustomItem={(itemType) => dispatch({ type: "toggle-custom-item", itemType })}
        timers={state.timers}
        displayMode={state.settings.displayMode}
        itemAlerts={state.settings.itemAlerts}
        gameClockMs={gameClockMs}
        gameClockRunning={state.gameClockRunning}
        onSetDisplayMode={(displayMode) => dispatch({ type: "set-display-mode", displayMode })}
        onToggleGameClock={() => dispatch({ type: "toggle-game-clock", nowMs })}
        onResetGameClock={() => dispatch({ type: "reset-game-clock" })}
        onActivateItem={(itemId) => activateItemWithSound(itemId, nowMs)}
      />
    );
  }, [gameClockMs, nowMs, presets, state]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <GuideModal
        open={guideOpen}
        onGotIt={() => {
          setGuideOpen(false);
        }}
        onNeverShowAgain={() => {
          dispatch({ type: "set-guide-never-show-again", value: true });
          setGuideOpen(false);
        }}
      />
      <NavigationDrawer
        activePage={state.page}
        isOpen={state.navOpen}
        onClose={() => dispatch({ type: "set-nav-open", open: false })}
        onSelectPage={(page) => {
          dispatch({ type: "set-page", page });
          dispatch({ type: "set-nav-open", open: false });
        }}
      />

      <div className="flex min-h-0 w-full flex-col">
        {globalHookError ? (
          <div className="border-b border-amber-700/50 bg-amber-950/50 px-3 py-1 text-xs text-amber-200">{globalHookError}</div>
        ) : null}
        <TitleBar
          appTitle={t("app.title")}
          globalHookEnabled={state.settings.globalHookActive}
          soundEnabled={state.settings.soundEnabled}
          alwaysOnTop={state.settings.alwaysOnTop}
          onToggleMenu={() => dispatch({ type: "set-nav-open", open: !state.navOpen })}
          onToggleSound={() => dispatch({ type: "toggle-sound" })}
          onToggleAlwaysOnTop={() => dispatch({ type: "toggle-always-on-top" })}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <header className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--t3)]">
            {t("pages.current")}: {state.page}
          </header>

          {state.page === "Main" ? (
            <section className="panel mb-3">
              <h2 className="panel-title">{t("pages.hookState")}</h2>
              <div className="flex items-center justify-between gap-2 text-sm font-medium text-[var(--t1)]">
                <div className="flex items-center gap-2">
                  <Circle size={12} className={state.settings.globalHookActive ? "fill-emerald-400 text-emerald-400" : "fill-gray-500 text-gray-500"} />
                  <span>{state.settings.globalHookActive ? t("pages.active") : t("pages.notActive")}</span>
                </div>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border2)] bg-[var(--surface)] text-[var(--t2)] transition-colors hover:text-[var(--t1)]"
                  type="button"
                  aria-label="Toggle global hook"
                  onClick={() => dispatch({ type: "toggle-global-hook" })}
                >
                  <Power size={18} className={state.settings.globalHookActive ? "text-emerald-400" : "text-rose-500"} />
                </button>
              </div>
            </section>
          ) : null}

          {pageNode}
        </main>
      </div>
    </div>
  );
}
