"use client";

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// ── Glass Panel ────────────────────────────────────────────────────────────────

type GlassPanelVariant = "default" | "elevated" | "muted" | "interactive";

export function GlassPanel({
  children,
  className,
  variant,
  bright,
  style,
}: {
  children: ReactNode;
  className?: string;
  variant?: GlassPanelVariant;
  bright?: boolean;
  style?: CSSProperties;
}) {
  const resolvedVariant = variant ?? (bright ? "elevated" : "default");

  return (
    <div
      className={cn(
        "glass-panel",
        "rounded-[var(--panel-radius)]",
        resolvedVariant === "elevated" && "glass-panel-elevated",
        resolvedVariant === "muted" && "glass-panel-muted",
        resolvedVariant === "interactive" && "glass-panel-default glass-panel-interactive",
        resolvedVariant === "default" && "glass-panel-default",
        className
      )}
      style={style}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Glass Button ───────────────────────────────────────────────────────────────

export function GlassButton({
  children,
  className,
  tone = "ghost",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5",
        "font-mono text-[11px] font-medium uppercase tracking-[0.08em]",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "primary" &&
          "bg-[color:var(--accent)] text-slate-950 shadow-[0_12px_28px_rgba(82,216,198,0.35)] hover:brightness-110 active:brightness-95",
        tone === "ghost" &&
          "glass-panel glass-panel-interactive border border-white/15 text-slate-200 hover:text-white active:scale-[0.99]",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Glass Input ────────────────────────────────────────────────────────────────

type GlassInputBase = {
  containerClassName?: string;
  className?: string;
};

type GlassInputAsInput = GlassInputBase &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type GlassInputAsTextarea = GlassInputBase &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

export function GlassInput(props: GlassInputAsInput | GlassInputAsTextarea) {
  const sharedClassName = (
    className?: string
  ) =>
    cn(
      "w-full bg-transparent text-sm text-[color:var(--text-primary)]",
      "placeholder:text-slate-500/90 outline-none",
      "px-3.5 py-2.5 font-body",
      className
    );

  if (props.as === "textarea") {
    const { as: _as, containerClassName, className, ...textareaProps } = props;
    return (
      <GlassPanel variant="elevated" className={cn("p-1.5", containerClassName)}>
        <textarea
          {...textareaProps}
          className={cn(sharedClassName(className), "resize-none")}
        />
      </GlassPanel>
    );
  }

  const { as: _as, containerClassName, className, ...inputProps } = props;

  return (
    <GlassPanel variant="elevated" className={cn("p-1.5", containerClassName)}>
      <input {...inputProps} className={sharedClassName(className)} />
    </GlassPanel>
  );
}

// ── Glass Chip ─────────────────────────────────────────────────────────────────

const chipToneClasses = {
  default: "text-slate-300 border-white/10",
  accent: "text-teal-200 border-teal-300/25",
  sky: "text-sky-300 border-sky-300/25",
  violet: "text-violet-300 border-violet-300/25",
  amber: "text-amber-300 border-amber-300/25",
} as const;

export function GlassChip({
  children,
  className,
  tone = "default",
  active = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof chipToneClasses;
  active?: boolean;
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[10px] font-medium uppercase tracking-[0.1em] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60",
        "disabled:pointer-events-none disabled:opacity-40",
        "glass-panel glass-panel-muted",
        chipToneClasses[tone],
        active
          ? "bg-white/10 shadow-[0_0_0_1px_rgba(145,208,223,0.2)_inset,0_8px_18px_rgba(0,0,0,0.2)]"
          : "text-[color:var(--text-secondary)] hover:text-slate-200 hover:bg-white/5",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  icon,
  color = "default",
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  color?: "default" | "cyan" | "amber" | "green" | "red";
}) {
  const colorClasses = {
    default: "text-slate-100",
    cyan: "text-cyan-300",
    amber: "text-amber-300",
    green: "text-emerald-300",
    red: "text-red-300",
  };

  return (
    <GlassPanel variant="muted" className="p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {label}
          </div>
          <div className={cn("mt-1 font-mono text-base font-semibold tracking-tight", colorClasses[color])}>
            {value}
          </div>
        </div>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
    </GlassPanel>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "web" | "paper" | "active" | "complete" | "error";
}) {
  const classes = {
    default: "text-slate-300 border-white/15",
    web: "text-sky-300 border-sky-400/30",
    paper: "text-violet-300 border-violet-400/30",
    active: "text-teal-300 border-teal-400/30",
    complete: "text-emerald-300 border-emerald-400/30",
    error: "text-red-300 border-red-400/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "font-mono text-[10px] font-medium uppercase tracking-[0.1em]",
        "glass-panel glass-panel-muted",
        classes[variant]
      )}
    >
      {children}
    </span>
  );
}

// ── Section Label ──────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
      {children}
    </div>
  );
}

// ── Loading ────────────────────────────────────────────────────────────────────

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"
          style={{
            animation: "fadeUp 1s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl bg-white/5", className)} />;
}
