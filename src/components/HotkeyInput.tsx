import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!capturing) {
      return;
    }

    document.body.dataset.hotkeyCaptureActive = "true";

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        setCapturing(false);
        return;
      }

      const parsed = eventToHotkey(event);
      if (!parsed || !isValidHotkey(parsed)) {
        return;
      }

      onAssign(itemId, parsed);
      setCapturing(false);
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      delete document.body.dataset.hotkeyCaptureActive;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [capturing, itemId, onAssign]);

  return (
    <div className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="text-sm">{itemLabel}</span>
      <button
        type="button"
        data-hotkey-capture={capturing ? "true" : undefined}
        className={capturing ? "rounded border border-indigo-500 px-2 py-1 text-xs text-indigo-300" : "rounded border border-[var(--border2)] px-2 py-1 text-xs text-[var(--t2)]"}
        onClick={() => setCapturing(true)}
      >
        {capturing ? t("settings.pressKeys") : hotkey}
      </button>
    </div>
  );
}
