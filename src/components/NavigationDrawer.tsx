import { useTranslation } from "react-i18next";
import { CircleHelp, Home, Settings, Swords } from "lucide-react";
import type { ReactNode } from "react";
import { PAGES, type Page } from "../types/ui";

type NavigationDrawerProps = {
  activePage: Page;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
};

export function NavigationDrawer({ activePage, isOpen, onClose, onSelectPage }: NavigationDrawerProps) {
  const { t } = useTranslation();

  const iconByPage: Record<Page, ReactNode> = {
    Main: <Home size={14} />,
    Trainer: <Swords size={14} />,
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

      <nav className={isOpen ? "drawer drawer-open" : "drawer"} aria-label="Main navigation">
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
      </nav>
    </>
  );
}
