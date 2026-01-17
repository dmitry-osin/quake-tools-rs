import { useTranslation } from "react-i18next";

export function TrainerPage() {
  const { t } = useTranslation();

  return (
    <section className="panel space-y-2">
      <h2 className="panel-title">{t("trainer.title")}</h2>
      <p className="text-sm text-[var(--t2)]">{t("trainer.placeholder")}</p>
      <progress className="h-2 w-full" value={0} max={100} />
    </section>
  );
}
