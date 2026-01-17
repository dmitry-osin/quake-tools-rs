import { useTranslation } from "react-i18next";
import { PAGES, type Page } from "../types/ui";

type NavigationDrawerProps = {
  activePage: Page;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: Page) => void;
};

export function NavigationDrawer({ activePage, isOpen, onClose, onSelectPage }: NavigationDrawerProps) {
  const { t } = useTranslation();

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
                {t(`navigation.${page.toLowerCase()}`)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
