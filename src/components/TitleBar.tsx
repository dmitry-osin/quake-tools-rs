import { Menu, Pin, PinOff, Radio, Volume2, VolumeX } from "lucide-react";

type TitleBarProps = {
  appTitle: string;
  globalHookEnabled: boolean;
  soundEnabled: boolean;
  alwaysOnTop: boolean;
  onToggleMenu: () => void;
  onToggleGlobalHook: () => void;
  onToggleSound: () => void;
  onToggleAlwaysOnTop: () => void;
};

export function TitleBar({
  appTitle,
  globalHookEnabled,
  soundEnabled,
  alwaysOnTop,
  onToggleMenu,
  onToggleGlobalHook,
  onToggleSound,
  onToggleAlwaysOnTop,
}: TitleBarProps) {
  return (
    <header className="flex h-10 items-center justify-between border-b border-[var(--border)] bg-[var(--titlebar-bg)] px-3" data-tauri-drag-region>
      <div className="flex items-center gap-2">
        <button
          className="icon-button"
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleMenu}
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide">{appTitle}</span>
          <span
            className={globalHookEnabled ? "led led-active" : "led led-inactive"}
            aria-label={globalHookEnabled ? "Global hook active" : "Global hook inactive"}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="icon-button" type="button" aria-label="Toggle global hook" onClick={onToggleGlobalHook}>
          <Radio size={16} className={globalHookEnabled ? "text-emerald-400" : "text-[var(--t3)]"} />
        </button>
        <button className="icon-button" type="button" aria-label="Toggle sound" onClick={onToggleSound}>
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button className="icon-button" type="button" aria-label="Toggle always on top" onClick={onToggleAlwaysOnTop}>
          {alwaysOnTop ? <Pin size={16} className="text-indigo-500" /> : <PinOff size={16} />}
        </button>
      </div>
    </header>
  );
}
