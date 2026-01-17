import { useState } from "react";
import { useTranslation } from "react-i18next";

export function CheatSheet() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <button className="w-full rounded border border-[var(--border2)] px-3 py-2 text-left text-sm" type="button" onClick={() => setOpen((prev) => !prev)}>
        {open ? t("cheatSheet.hide") : t("cheatSheet.show")}
      </button>

      {open ? (
        <div className="mt-3 grid gap-2 text-sm text-[var(--t2)]">
          <div>{t("cheatSheet.placeholderLine1")}</div>
          <div>{t("cheatSheet.placeholderLine2")}</div>
        </div>
      ) : null}
    </section>
  );
}
