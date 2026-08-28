import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { availabilityLabel, money } from "@/lib/engine";
import type { Availability } from "@/lib/data";

export function SectionTitle({
  title,
  action,
  hint,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel p-4", className)}>{children}</div>;
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-surface-2 p-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="num mt-1 text-lg font-semibold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PriceBadge({ amount, prefix }: { amount: number; prefix?: string }) {
  return (
    <span className="num rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
      {prefix}
      {amount === 0 ? "Free" : money(amount)}
    </span>
  );
}

const availStyles: Record<Availability, string> = {
  available: "bg-success/12 text-success",
  limited: "bg-warning/18 text-warning-foreground",
  unavailable: "bg-destructive/12 text-destructive",
  unknown: "bg-muted text-muted-foreground",
};

export function AvailabilityBadge({ status }: { status: Availability }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", availStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {availabilityLabel[status]}
    </span>
  );
}

export function VerificationBadge({ hoursAgo, community }: { hoursAgo: number; community?: boolean }) {
  const tone = community
    ? "bg-muted text-muted-foreground"
    : hoursAgo <= 24
      ? "bg-success/12 text-success"
      : "bg-warning/18 text-warning-foreground";
  const label = community
    ? "Community reported"
    : hoursAgo <= 24
      ? `Verified ${hoursAgo <= 1 ? "just now" : `${hoursAgo}h ago`}`
      : `Needs verification · ${Math.round(hoursAgo / 24)}d`;
  return <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", tone)}>{label}</span>;
}

export function OpenBadge({ open, opens }: { open: boolean; opens: number }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-medium",
        open ? "bg-success/12 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {open ? "Open now" : `Opens ${String(opens).padStart(2, "0")}:00`}
    </span>
  );
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <span className="num absolute text-[11px] font-semibold">{score}</span>
    </span>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="num text-xs text-muted-foreground">
      {value.toFixed(1)}
      {count ? ` (${count > 999 ? `${Math.round(count / 100) / 10}k` : count})` : ""}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-2 p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}
