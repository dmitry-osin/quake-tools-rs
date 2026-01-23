import { useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { ALL_ITEM_TYPES, getPresetsByGame } from "../data/gameData";
import { NavigationDrawer } from "../components/NavigationDrawer";
import { TitleBar } from "../components/TitleBar";
import { AboutPage } from "../pages/AboutPage";
import { MainPage } from "../pages/MainPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TrainerPage } from "../pages/TrainerPage";
import { appReducer, initialAppState } from "../state/appState";
import type { Game } from "../types/domain";

export function AppShell() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [globalHookEnabled, setGlobalHookEnabled] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const presets = useMemo(() => getPresetsByGame(state.game), [state.game]);

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
      />
    );
  }, [presets, state]);

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
          globalHookEnabled={globalHookEnabled}
          soundEnabled={soundEnabled}
          alwaysOnTop={alwaysOnTop}
          onToggleMenu={() => dispatch({ type: "set-nav-open", open: !state.navOpen })}
          onToggleGlobalHook={() => setGlobalHookEnabled((prev) => !prev)}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onToggleAlwaysOnTop={() => setAlwaysOnTop((prev) => !prev)}
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
