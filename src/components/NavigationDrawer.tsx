import { useTranslation } from "react-i18next";
import { BookText, CircleHelp, Clock3, Info, Settings, Swords, User } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState, type ReactNode } from "react";
import { PAGES, type Page } from "../types/ui";

type NavigationDrawerProps = {
  activePage: Page;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
};

export function NavigationDrawer({ activePage, isOpen, onClose, onSelectPage }: NavigationDrawerProps) {
  const { t } = useTranslation();
  const [version, setVersion] = useState("-");

  useEffect(() => {
    void (async () => {
      try {
        setVersion(await getVersion());
      } catch {
        setVersion("-");
      }
    })();
  }, []);

  const iconByPage: Record<Page, ReactNode> = {
    Timers: <Clock3 size={14} />,
    Trainer: <Swords size={14} />,
    CVars: <BookText size={14} />,
    Settings: <Settings size={14} />,
    About: <CircleHelp size={14} />,
  };

  return (
    <>
      <div
        className={isOpen ? "drawer-backdrop drawer-backdrop-open" : "drawer-backdrop"}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <nav className={isOpen ? "drawer drawer-open flex flex-col" : "drawer flex flex-col"} aria-label="Main navigation">
        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--t4)]">{t("navigation.title")}</div>
          <ul className="space-y-1">
            {PAGES.map((page) => (
              <li key={page}>
                <button
                  className={activePage === page ? "nav-item nav-item-active" : "nav-item"}
                  type="button"
                  onClick={() => onSelectPage(page)}
                >
                  <span className="flex items-center gap-2">
                    {iconByPage[page]}
                    <span>{t(`navigation.${page.toLowerCase()}`)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-t border-[var(--border2)] pt-2 text-[11px] text-[var(--t3)]">
          <div className="flex items-center gap-1 text-[var(--t2)]">
            <Info size={12} />
            <span>
              {t("app.title")} v{version}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[var(--t2)]">
            <User size={12} />
            <span>Dmitry Osin</span>
          </div>
        </div>
      </nav>
    </>
  );
}
