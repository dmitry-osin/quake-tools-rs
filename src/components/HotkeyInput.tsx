import { useState } from "react";
import { useTranslation } from "react-i18next";
import { eventToHotkey, isValidHotkey } from "../hotkeys/hotkeyUtils";

type HotkeyInputProps = {
  itemId: string;
  itemLabel: string;
  hotkey: string;
  onAssign: (itemId: string, hotkey: string) => void;
};

export function HotkeyInput({ itemId, itemLabel, hotkey, onAssign }: HotkeyInputProps) {
  const { t } = useTranslation();
  const [capturing, setCapturing] = useState(false);

  return (
    <div className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="text-sm">{itemLabel}</span>
      <button
        type="button"
        className={capturing ? "rounded border border-indigo-500 px-2 py-1 text-xs text-indigo-300" : "rounded border border-[var(--border2)] px-2 py-1 text-xs text-[var(--t2)]"}
        onClick={() => setCapturing(true)}
        onKeyDown={(event) => {
          if (!capturing) {
            return;
          }

          event.preventDefault();

          if (event.key === "Escape") {
            setCapturing(false);
            return;
          }

          const parsed = eventToHotkey(event.nativeEvent);
          if (!parsed || !isValidHotkey(parsed)) {
            return;
          }

          onAssign(itemId, parsed);
          setCapturing(false);
        }}
      >
        {capturing ? t("settings.pressKeys") : hotkey}
      </button>
    </div>
  );
}
