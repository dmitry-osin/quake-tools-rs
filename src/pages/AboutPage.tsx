import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QUAKE_CHAMPIONS_PRESETS, QUAKE_LIVE_PRESETS } from "../data/gameData";

const REPOSITORY_URL = "https://github.com/dmitry-osin/quake-tools-rs";

export function AboutPage() {
  const { t } = useTranslation();
  const [version, setVersion] = useState("-");

  useEffect(() => {
    void (async () => {
      try {
        const value = await getVersion();
        setVersion(value);
      } catch {
        setVersion("-");
      }
    })();
  }, []);

  return (
    <section className="space-y-3">
      <section className="panel space-y-2">
        <h2 className="panel-title">{t("about.title")}</h2>
        <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-sm">
          <div>
            {t("about.author")}: <span className="text-[var(--t1)]">Dmitry Osin</span>
          </div>
          <div>
            {t("about.version")}: <span className="text-[var(--t1)]">{version}</span>
          </div>
          <button type="button" className="mt-1 text-left text-cyan-300 underline" onClick={() => openUrl(REPOSITORY_URL)}>
            {t("about.repository")}: github.com/dmitry-osin/quake-tools-rs
          </button>
          <p className="mt-2 rounded border border-[var(--border2)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--t2)]">
            {t("about.disclaimer")}
          </p>
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("about.stack")}</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            "Rust",
            "Tauri",
            "React",
            "Tailwind CSS",
            "Lucide",
          ].map((badge) => (
            <span key={badge} className="rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1">
              {badge}
            </span>
          ))}
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("about.credits")}</h2>
        <div className="space-y-2 rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-xs text-[var(--t2)]">
          <div>
            {t("about.cvarsDatabase")}:{" "}
            <button type="button" className="text-cyan-300 underline" onClick={() => openUrl("https://quakeliveconfigeditor.com/cvars/")}>
              https://quakeliveconfigeditor.com/cvars/
            </button>
          </div>
          <div>
            {t("about.configEditor")}:{" "}
            <button type="button" className="text-cyan-300 underline" onClick={() => openUrl("https://quakeliveconfigeditor.com/")}>
              https://quakeliveconfigeditor.com/
            </button>
          </div>
          <div>
            {t("about.ryanBassett")}:{" "}
            <button type="button" className="text-cyan-300 underline" onClick={() => openUrl("https://bassettgraphics.com/")}>
              https://bassettgraphics.com/
            </button>
          </div>
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("about.respawnRules")}</h2>
        <div className="overflow-hidden rounded border border-[var(--border2)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface2)] text-[var(--t2)]">
              <tr>
                <th className="px-2 py-1">{t("about.game")}</th>
                <th className="px-2 py-1">{t("about.rule")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--border2)]">
                <td className="px-2 py-1">{t("about.ql")}</td>
                <td className="px-2 py-1">{t("about.qlRule")}</td>
              </tr>
              <tr className="border-t border-[var(--border2)]">
                <td className="px-2 py-1">{t("about.qc")}</td>
                <td className="px-2 py-1">{t("about.qcRule")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("about.mapPresets")}</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-xs">
            <div className="mb-1 text-[var(--t1)]">{t("about.ql")}</div>
            <ul className="space-y-1 text-[var(--t2)]">
              {QUAKE_LIVE_PRESETS.map((preset) => (
                <li key={preset.id}>{preset.name}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-xs">
            <div className="mb-1 text-[var(--t1)]">{t("about.qc")}</div>
            <ul className="space-y-1 text-[var(--t2)]">
              {QUAKE_CHAMPIONS_PRESETS.map((preset) => (
                <li key={preset.id}>{preset.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </section>
  );
}
