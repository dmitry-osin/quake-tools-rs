import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { playStage1, playStage2, playStage3 } from "../audio/alertAudio";
import { ALL_ITEM_TYPES, getPresetsByGame } from "../data/gameData";
import { eventToHotkey, normalizeHotkeyInput, toPluginHotkey } from "../hotkeys/hotkeyUtils";
import { NavigationDrawer } from "../components/NavigationDrawer";
import { TitleBar } from "../components/TitleBar";
import { AboutPage } from "../pages/AboutPage";
import { MainPage } from "../pages/MainPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TrainerPage } from "../pages/TrainerPage";
import { appReducer, initialAppState, selectGameClockMs } from "../state/appState";
import type { Game } from "../types/domain";

export function AppShell() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [globalHookError, setGlobalHookError] = useState<string | null>(null);
  const previousSecondsRef = useRef<Record<string, number>>({});

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

    for (const itemId of Object.keys(state.timers)) {
      const timer = state.timers[itemId];
      if (timer.status !== "Running") {
        continue;
      }

      const currentSeconds = Math.max(0, Math.ceil(timer.remainingMs / 1000));
      const previousSeconds = previousSecondsRef.current[itemId];

      if (
        state.settings.soundEnabled &&
        previousSeconds !== undefined &&
        previousSeconds !== currentSeconds
      ) {
        if (
          previousSeconds > state.settings.stage1.thresholdSeconds &&
          currentSeconds <= state.settings.stage1.thresholdSeconds &&
          state.settings.stage1.soundEnabled
        ) {
          playStage1(state.settings.stage1.volume);
        }

        if (
          previousSeconds > state.settings.stage2.thresholdSeconds &&
          currentSeconds <= state.settings.stage2.thresholdSeconds &&
          state.settings.stage2.soundEnabled
        ) {
          playStage2(state.settings.stage2.volume);
        }

        if (
          currentSeconds <= state.settings.stage3.thresholdSeconds &&
          currentSeconds > 0 &&
          state.settings.stage3.soundEnabled
        ) {
          playStage3(state.settings.stage3.volume);
        }
      }

      nextSeconds[itemId] = currentSeconds;
    }

    previousSecondsRef.current = nextSeconds;
  }, [state.settings, state.timers]);

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

      try {
        for (const item of state.items) {
          await register(toPluginHotkey(item.hotkey), () => {
            dispatch({ type: "activate-item", itemId: item.id, nowMs: Date.now() });
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
  }, [state.items, state.settings.globalHookActive, t]);

  useEffect(() => {
    if (state.settings.globalHookActive && !globalHookError) {
      return;
    }

    const listener = (event: KeyboardEvent) => {
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
      dispatch({ type: "activate-item", itemId: item.id, nowMs: Date.now() });
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [globalHookError, state.items, state.settings.globalHookActive]);

  const presets = useMemo(() => getPresetsByGame(state.game), [state.game]);
  const gameClockMs = useMemo(() => selectGameClockMs(state, nowMs), [nowMs, state]);

  const pageNode = useMemo(() => {
    if (state.page === "Trainer") {
      return <TrainerPage />;
    }

    if (state.page === "Settings") {
      return <SettingsPage />;
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
        hotkeyConflict={state.hotkeyConflict}
        allItemTypes={ALL_ITEM_TYPES}
        onSelectGame={(game: Game) => dispatch({ type: "set-game", game })}
        onSelectPreset={(presetId) => dispatch({ type: "set-preset", presetId })}
        onToggleCustomItem={(itemType) => dispatch({ type: "toggle-custom-item", itemType })}
        timers={state.timers}
        displayMode={state.settings.displayMode}
        stage1={state.settings.stage1}
        stage2={state.settings.stage2}
        stage3={state.settings.stage3}
        soundEnabled={state.settings.soundEnabled}
        gameClockMs={gameClockMs}
        gameClockRunning={state.gameClockRunning}
        onSetDisplayMode={(displayMode) => dispatch({ type: "set-display-mode", displayMode })}
        onAssignHotkey={(itemId, hotkey) => dispatch({ type: "assign-hotkey", itemId, hotkey })}
        onClearHotkeyConflict={() => dispatch({ type: "clear-hotkey-conflict" })}
        onToggleStageSound={(stage) => dispatch({ type: "toggle-stage-sound", stage })}
        onToggleGameClock={() => dispatch({ type: "toggle-game-clock", nowMs })}
        onResetGameClock={() => dispatch({ type: "reset-game-clock" })}
        onActivateItem={(itemId) => dispatch({ type: "activate-item", itemId, nowMs })}
      />
    );
  }, [gameClockMs, nowMs, presets, state]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
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
          onToggleGlobalHook={() => dispatch({ type: "toggle-global-hook" })}
          onToggleSound={() => dispatch({ type: "toggle-sound" })}
          onToggleAlwaysOnTop={() => dispatch({ type: "toggle-always-on-top" })}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <header className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--t3)]">
            {t("pages.current")}: {state.page}
          </header>
          {pageNode}
        </main>
      </div>
    </div>
  );
}
