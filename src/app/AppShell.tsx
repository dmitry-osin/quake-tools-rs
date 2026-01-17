import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavigationDrawer } from "../components/NavigationDrawer";
import { TitleBar } from "../components/TitleBar";
import { AboutPage } from "../pages/AboutPage";
import { MainPage } from "../pages/MainPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TrainerPage } from "../pages/TrainerPage";
import type { Page } from "../types/ui";

export function AppShell() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState<Page>("Main");
  const [navOpen, setNavOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [globalHookEnabled, setGlobalHookEnabled] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const pageNode = useMemo(() => {
    if (activePage === "Trainer") {
      return <TrainerPage />;
    }

    if (activePage === "Settings") {
      return <SettingsPage />;
    }

    if (activePage === "About") {
      return <AboutPage />;
    }

    return <MainPage />;
  }, [activePage]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <NavigationDrawer
        activePage={activePage}
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onSelectPage={(page) => {
          setActivePage(page);
          setNavOpen(false);
        }}
      />

      <div className="flex min-h-0 w-full flex-col">
        <TitleBar
          appTitle={t("app.title")}
          globalHookEnabled={globalHookEnabled}
          soundEnabled={soundEnabled}
          alwaysOnTop={alwaysOnTop}
          onToggleMenu={() => setNavOpen((prev) => !prev)}
          onToggleGlobalHook={() => setGlobalHookEnabled((prev) => !prev)}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          onToggleAlwaysOnTop={() => setAlwaysOnTop((prev) => !prev)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <header className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--t3)]">
            {t("pages.current")}: {activePage}
          </header>
          {pageNode}
        </main>
      </div>
    </div>
  );
}
