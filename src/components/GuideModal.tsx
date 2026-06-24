import { useTranslation } from "react-i18next";

type GuideModalProps = {
  open: boolean;
  onGotIt: () => void;
  onNeverShowAgain: () => void;
};

export function GuideModal({ open, onGotIt, onNeverShowAgain }: GuideModalProps) {
  const { t } = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--border2)] bg-[var(--surface)] p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--t2)]">{t("guide.title")}</h2>
        <p className="mb-3 text-sm text-[var(--t2)]">{t("guide.intro")}</p>
        <ul className="mb-4 space-y-2 text-sm text-[var(--t2)]">
          <li>- {t("guide.hook")}</li>
          <li>- {t("guide.settings")}</li>
          <li>- {t("guide.hotkeys")}</li>
          <li>- {t("guide.cvars")}</li>
          <li>- {t("guide.trainer")}</li>
        </ul>
        <div className="grid gap-2">
          <button type="button" className="nav-item nav-item-active w-full" onClick={onGotIt}>
            {t("guide.gotIt")}
          </button>
          <button type="button" className="nav-item w-full" onClick={onNeverShowAgain}>
            {t("guide.neverShowAgain")}
          </button>
        </div>
      </div>
    </div>
  );
}
