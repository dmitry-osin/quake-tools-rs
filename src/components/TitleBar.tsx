import { Menu, Pin, PinOff, Radio, Volume2, VolumeX } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { MouseEvent } from "react";

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
  const handleTitleDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    void getCurrentWindow().startDragging();
  };

  return (
    <header className="flex h-10 items-center justify-between border-b border-[var(--border)] bg-[var(--titlebar-bg)] px-3">
      <div className="flex items-center gap-2">
        <button
          className="icon-button"
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleMenu}
          data-no-drag="true"
        >
          <Menu size={16} />
        </button>

      </div>

      <div
        className="mx-2 flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing"
        data-tauri-drag-region
        onMouseDown={handleTitleDrag}
      >
        <span className="truncate text-sm font-semibold tracking-wide" data-tauri-drag-region>
          {appTitle}
        </span>
        <span
          className={globalHookEnabled ? "led led-active" : "led led-inactive"}
          aria-label={globalHookEnabled ? "Global hook active" : "Global hook inactive"}
          data-tauri-drag-region
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="icon-button" type="button" aria-label="Toggle global hook" onClick={onToggleGlobalHook} data-no-drag="true">
          <Radio size={16} className={globalHookEnabled ? "text-emerald-400" : "text-[var(--t3)]"} />
        </button>
        <button className="icon-button" type="button" aria-label="Toggle sound" onClick={onToggleSound} data-no-drag="true">
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button className="icon-button" type="button" aria-label="Toggle always on top" onClick={onToggleAlwaysOnTop} data-no-drag="true">
          {alwaysOnTop ? <Pin size={16} className="text-indigo-500" /> : <PinOff size={16} />}
        </button>
      </div>
    </header>
  );
}
