import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-6 w-6", className)}>
      <path
        d="M16 3c5 0 9 4 9 9 0 6.4-9 17-9 17S7 18.4 7 12c0-5 4-9 9-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M21 8l-3.3 5.4L12 16.5l3.3-5.4L21 8Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LogoMark className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">NeonGuide AI</span>
          <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Local intelligence</span>
        </span>
      )}
    </span>
  );
}

export type AIState = "ready" | "thinking" | "planning" | "alert";

const stateStyles: Record<AIState, { ring: string; dot: string; label: string }> = {
  ready: { ring: "border-success/40", dot: "bg-success", label: "Ready" },
  thinking: { ring: "border-primary/40", dot: "bg-primary animate-pulse", label: "Thinking" },
  planning: { ring: "border-chart-5/50", dot: "bg-chart-5 animate-pulse", label: "Planning" },
  alert: { ring: "border-warning/60", dot: "bg-warning", label: "Attention" },
};

export function AIOrb({ state = "ready", size = 36 }: { state?: AIState; size?: number }) {
  const s = stateStyles[state];
  return (
    <span
      className={cn("relative flex items-center justify-center rounded-full border bg-surface-2", s.ring)}
      style={{ width: size, height: size }}
      title={`AI ${s.label}`}
    >
      <LogoMark className="h-1/2 w-1/2 text-primary" />
      <span className={cn("absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full", s.dot)} />
    </span>
  );
}

export function AIStateLabel({ state }: { state: AIState }) {
  return <span className="text-xs text-muted-foreground">{stateStyles[state].label}</span>;
}
