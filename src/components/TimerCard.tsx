import { Heart, HeartPulse, Shield } from "lucide-react";

type TimerCardProps = {
  label: string;
  hotkey: string;
  icon: "armor" | "mega" | "health";
  color: string;
  spawnSeconds: number;
  status: "Idle" | "Running" | "Expired";
  displayValue: string;
  progressPercent: number;
  onActivate: () => void;
};

export function TimerCard({
  label,
  hotkey,
  icon,
  color,
  spawnSeconds,
  status,
  displayValue,
  progressPercent,
  onActivate,
}: TimerCardProps) {
  const iconNode =
    icon === "armor" ? (
      <Shield size={16} color={color} />
    ) : icon === "mega" ? (
      <HeartPulse size={16} color={color} />
    ) : (
      <Heart size={16} color={color} />
    );

  return (
    <button
      type="button"
      onClick={onActivate}
      className={status === "Running" ? "relative w-full rounded-lg border-l-4 bg-[var(--surface)] p-3 text-left border-l-[var(--accent)]" : "relative w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-left"}
    >
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {iconNode}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="rounded bg-[var(--surface2)] px-2 py-0.5 text-xs text-[var(--t2)]">{hotkey}</span>
      </header>
      <div className="text-2xl font-semibold text-[var(--t1)] tabular-nums">{displayValue}</div>
      <div className="mt-1 text-xs text-[var(--t3)]">Spawn: {spawnSeconds}s</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-[var(--border2)]">
        <div className="h-full rounded bg-[var(--accent)] transition-[width] duration-100" style={{ width: `${progressPercent}%` }} />
      </div>

      {status === "Expired" ? (
        <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/55 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t1)]">
          Click to confirm pickup
        </div>
      ) : null}
    </button>
  );
}
