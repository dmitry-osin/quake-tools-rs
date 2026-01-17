import { useTranslation } from "react-i18next";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <section className="panel space-y-2">
      <h2 className="panel-title">{t("settings.title")}</h2>
      <p className="text-sm text-[var(--t2)]">{t("settings.placeholder")}</p>
    </section>
  );
}
