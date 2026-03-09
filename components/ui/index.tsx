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
        "inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2",
        "font-mono text-[11px] font-medium uppercase tracking-[0.1em]",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
        "disabled:pointer-events-none disabled:opacity-40",
        tone === "primary" &&
          "border-white/10 bg-[color:var(--accent)] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_rgba(103,213,198,0.22)] hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:brightness-95",
        tone === "ghost" &&
          "border-white/10 bg-white/[0.045] text-[color:var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[var(--panel-blur-soft)] hover:border-white/16 hover:bg-white/[0.06] hover:text-[color:var(--text-primary)] active:scale-[0.99]",
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
  panelVariant?: GlassPanelVariant | "bare";
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
  const sharedClassName = (className?: string) =>
    cn(
      "w-full bg-transparent text-[15px] leading-6 text-[color:var(--text-primary)]",
      "placeholder:text-[color:var(--text-tertiary)] outline-none",
      "px-3.5 py-3 font-body",
      className
    );

  const renderContainer = (
    children: ReactNode,
    panelVariant: GlassPanelVariant | "bare",
    containerClassName?: string
  ) =>
    panelVariant === "bare" ? (
      <div className={containerClassName}>{children}</div>
    ) : (
      <GlassPanel variant={panelVariant} className={cn("p-1.5", containerClassName)}>
        {children}
      </GlassPanel>
    );

  if (props.as === "textarea") {
    const {
      as: _as,
      containerClassName,
      className,
      panelVariant = "elevated",
      ...textareaProps
    } = props;
    return renderContainer(
      <textarea
        {...textareaProps}
        className={cn(sharedClassName(className), "resize-none")}
      />,
      panelVariant,
      containerClassName
    );
  }

  const {
    as: _as,
    containerClassName,
    className,
    panelVariant = "elevated",
    ...inputProps
  } = props;

  return renderContainer(
    <input {...inputProps} className={sharedClassName(className)} />,
    panelVariant,
    containerClassName
  );
}

// ── Glass Chip ─────────────────────────────────────────────────────────────────

const chipToneClasses = {
  default: {
    active: "border-white/14 bg-white/[0.09] text-slate-100",
    idle: "border-white/8 text-[color:var(--text-secondary)] hover:border-white/12 hover:bg-white/[0.05] hover:text-slate-100",
  },
  accent: {
    active: "border-teal-300/24 bg-teal-300/12 text-teal-100",
    idle: "border-white/8 text-[color:var(--text-secondary)] hover:border-teal-300/18 hover:bg-teal-300/[0.06] hover:text-teal-100",
  },
  sky: {
    active: "border-sky-300/24 bg-sky-300/12 text-sky-100",
    idle: "border-white/8 text-[color:var(--text-secondary)] hover:border-sky-300/18 hover:bg-sky-300/[0.06] hover:text-sky-100",
  },
  violet: {
    active: "border-violet-300/24 bg-violet-300/12 text-violet-100",
    idle: "border-white/8 text-[color:var(--text-secondary)] hover:border-violet-300/18 hover:bg-violet-300/[0.06] hover:text-violet-100",
  },
  amber: {
    active: "border-amber-300/24 bg-amber-300/12 text-amber-100",
    idle: "border-white/8 text-[color:var(--text-secondary)] hover:border-amber-300/18 hover:bg-amber-300/[0.06] hover:text-amber-100",
  },
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
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 py-2",
        "font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-all duration-200",
        "bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[var(--panel-blur-soft)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
        "disabled:pointer-events-none disabled:opacity-40",
        active ? chipToneClasses[tone].active : chipToneClasses[tone].idle,
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
    default: "text-[color:var(--text-secondary)] border-white/10",
    web: "bg-sky-300/[0.08] text-sky-200 border-sky-400/24",
    paper: "bg-violet-300/[0.08] text-violet-200 border-violet-400/24",
    active: "bg-teal-300/[0.08] text-teal-100 border-teal-400/24",
    complete: "bg-emerald-300/[0.08] text-emerald-100 border-emerald-400/24",
    error: "bg-red-300/[0.08] text-red-100 border-red-400/24",
  };

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5",
        "font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
        "bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[var(--panel-blur-soft)]",
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
    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-tertiary)]">
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
