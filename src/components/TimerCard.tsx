import { Heart, HeartPulse, Shield } from "lucide-react";

type TimerCardProps = {
  label: string;
  hotkey: string;
  icon: "armor" | "mega" | "health";
  color: string;
};

export function TimerCard({ label, hotkey, icon, color }: TimerCardProps) {
  const iconNode =
    icon === "armor" ? (
      <Shield size={16} color={color} />
    ) : icon === "mega" ? (
      <HeartPulse size={16} color={color} />
    ) : (
      <Heart size={16} color={color} />
    );

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <header className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {iconNode}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="rounded bg-[var(--surface2)] px-2 py-0.5 text-xs text-[var(--t2)]">{hotkey}</span>
      </header>
      <div className="text-2xl font-semibold text-[var(--t1)]">--</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-[var(--border2)]">
        <div className="h-full w-0 rounded bg-[var(--accent)]" />
      </div>
    </article>
  );
}
