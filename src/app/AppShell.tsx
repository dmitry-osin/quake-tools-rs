import { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { ALL_ITEM_TYPES, getPresetsByGame } from "../data/gameData";
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      dispatch({ type: "tick", nowMs: now });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, []);

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
        allItemTypes={ALL_ITEM_TYPES}
        onSelectGame={(game: Game) => dispatch({ type: "set-game", game })}
        onSelectPreset={(presetId) => dispatch({ type: "set-preset", presetId })}
        onToggleCustomItem={(itemType) => dispatch({ type: "toggle-custom-item", itemType })}
        timers={state.timers}
        displayMode={state.settings.displayMode}
        gameClockMs={gameClockMs}
        gameClockRunning={state.gameClockRunning}
        onSetDisplayMode={(displayMode) => dispatch({ type: "set-display-mode", displayMode })}
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
