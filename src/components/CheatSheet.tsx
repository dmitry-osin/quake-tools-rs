import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Game } from "../types/domain";

type CheatSheetProps = {
  game: Game;
};

const QL_ARMOR_ROWS = [
  "0 -> 25",
  "5 -> 30",
  "10 -> 35",
  "15 -> 40",
  "20 -> 45",
  "25 -> 50",
  "30 -> 55",
  "35 -> 0",
  "40 -> 5",
  "45 -> 10",
  "50 -> 15",
  "55 -> 20",
];

const QL_HEALTH_ROWS = [
  "0 -> 35",
  "5 -> 40",
  "10 -> 45",
  "15 -> 50",
  "20 -> 55",
  "25 -> 0",
  "30 -> 5",
  "35 -> 10",
  "40 -> 15",
  "45 -> 20",
  "50 -> 25",
  "55 -> 30",
];

const QC_ROWS = [
  "0 -> 30",
  "5 -> 35",
  "10 -> 40",
  "15 -> 45",
  "20 -> 50",
  "25 -> 55",
  "30 -> 0",
  "35 -> 5",
  "40 -> 10",
  "45 -> 15",
  "50 -> 20",
  "55 -> 25",
];

export function CheatSheet({ game }: CheatSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const sections =
    game === "QuakeLive"
      ? [
          { title: t("cheatSheet.qlArmor"), rows: QL_ARMOR_ROWS },
          { title: t("cheatSheet.qlHealth"), rows: QL_HEALTH_ROWS },
        ]
      : [{ title: t("cheatSheet.qcShared"), rows: QC_ROWS }];

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <button className="w-full rounded border border-[var(--border2)] px-3 py-2 text-left text-sm" type="button" onClick={() => setOpen((prev) => !prev)}>
        {open ? t("cheatSheet.hide") : t("cheatSheet.show")}
      </button>

      {open ? (
        <div className="mt-3 grid gap-3 text-sm text-[var(--t2)]">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--t3)]">{section.title}</div>
              <div className="flex flex-wrap gap-2">
                {section.rows.map((row) => (
                  <span key={row} className="rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-xs">
                    {row.replace("->", "sec pickup ->")} sec spawn
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
