import { Heart, HeartPulse, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

type TimerCardProps = {
  label: string;
  hotkey: string;
  icon: "armor" | "mega" | "health";
  color: string;
  spawnSeconds: number;
  status: "Idle" | "Running" | "Expired";
  displayValue: string;
  remainingLabel?: string;
  progressPercent: number;
  alertColor: string | null;
  effectClassName: string;
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
  remainingLabel,
  progressPercent,
  alertColor,
  effectClassName,
  onActivate,
}: TimerCardProps) {
  const { t } = useTranslation();
  const iconNode =
    icon === "armor" ? (
      <Shield size={16} color={color} />
    ) : icon === "mega" ? (
      <HeartPulse size={16} color={color} />
    ) : (
      <Heart size={16} color={color} />
    );

  const runningClassName = status === "Running" && !alertColor ? "border-l-4" : "border";
  const textStyle = alertColor ? { color: alertColor } : undefined;
  const borderStyle =
    status === "Running" && !alertColor
      ? { borderLeftColor: color }
      : alertColor
        ? { borderColor: alertColor }
        : undefined;

  return (
    <button
      type="button"
      onClick={onActivate}
      className={`relative w-full rounded-lg bg-[var(--surface)] p-3 text-left ${runningClassName} border-[var(--border)] ${effectClassName}`}
      style={borderStyle}
    >
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {iconNode}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="rounded bg-[var(--surface2)] px-2 py-0.5 text-xs text-[var(--t2)]">{hotkey}</span>
      </header>
      <div className="text-2xl font-semibold tabular-nums" style={textStyle}>
        {displayValue}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-[var(--t3)]">
        <span>Spawn: {spawnSeconds}s</span>
        {remainingLabel ? <span className="tabular-nums">{remainingLabel}</span> : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-[var(--border2)]">
        <div
          className="h-full rounded transition-[width] duration-100"
          style={{ width: `${progressPercent}%`, backgroundColor: alertColor ?? color }}
        />
      </div>

      {status === "Expired" ? (
        <div className="absolute inset-0 grid place-items-center rounded-lg bg-black/55 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t1)]">
          {t("main.confirmPickup")}
        </div>
      ) : null}
    </button>
  );
}
