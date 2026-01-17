type HotkeyInputProps = {
  itemLabel: string;
  hotkey: string;
};

export function HotkeyInput({ itemLabel, hotkey }: HotkeyInputProps) {
  return (
    <div className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="text-sm">{itemLabel}</span>
      <button type="button" className="rounded border border-[var(--border2)] px-2 py-1 text-xs text-[var(--t2)]">
        {hotkey}
      </button>
    </div>
  );
}
