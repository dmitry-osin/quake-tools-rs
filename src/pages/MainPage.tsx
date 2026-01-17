import { useTranslation } from "react-i18next";
import { CheatSheet } from "../components/CheatSheet";
import { HotkeyInput } from "../components/HotkeyInput";
import { TimerCard } from "../components/TimerCard";

export function MainPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <div className="panel">
        <h2 className="panel-title">{t("main.gameMode")}</h2>
        <div className="text-sm text-[var(--t2)]">QL / QC toggle comes in stage 2.</div>
      </div>

      <div className="panel">
        <h2 className="panel-title">{t("main.hotkeys")}</h2>
        <div className="grid gap-2">
          <HotkeyInput itemLabel="Red Armor" hotkey="F1" />
          <HotkeyInput itemLabel="Yellow Armor" hotkey="F2" />
          <HotkeyInput itemLabel="Mega Health" hotkey="F4" />
        </div>
      </div>

      <div className="grid gap-2">
        <TimerCard label="Red Armor" hotkey="F1" icon="armor" color="#e74c3c" />
        <TimerCard label="Yellow Armor" hotkey="F2" icon="armor" color="#f39c12" />
        <TimerCard label="Mega Health" hotkey="F4" icon="mega" color="#9b59b6" />
      </div>

      <CheatSheet />
    </section>
  );
}
