"use client";

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PanelVariant = "default" | "elevated" | "muted" | "interactive";

export function GlassPanel({
  children,
  className,
  variant = "default",
  bright,
  style,
}: {
  children: ReactNode;
  className?: string;
  variant?: PanelVariant;
  bright?: boolean;
  style?: CSSProperties;
}) {
  const resolvedVariant = bright ? "elevated" : variant;

  return (
    <div
      className={cn(
        "glass-panel rounded-[var(--panel-radius)]",
        resolvedVariant === "elevated" && "glass-panel-elevated",
        resolvedVariant === "muted" && "glass-panel-muted",
        resolvedVariant === "interactive" && "glass-panel-interactive",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

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
        "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2",
        "font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
        "transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
        tone === "primary" &&
          "border-[color:var(--signal)] bg-[color:var(--signal)] text-[color:var(--ink)] hover:bg-[color:var(--signal-bright)]",
        tone === "ghost" &&
          "border-[color:var(--rule)] bg-transparent text-[color:var(--paper-muted)] hover:border-[color:var(--signal)] hover:text-[color:var(--paper)]",
        className
      )}
    >
      {children}
    </button>
  );
}

type InputBase = {
  containerClassName?: string;
  className?: string;
  panelVariant?: PanelVariant | "bare";
};

type InputProps = InputBase & InputHTMLAttributes<HTMLInputElement> & { as?: "input" };
type TextareaProps = InputBase & TextareaHTMLAttributes<HTMLTextAreaElement> & { as: "textarea" };

export function GlassInput(props: InputProps | TextareaProps) {
  const shared = (className?: string) =>
    cn(
      "w-full bg-transparent px-3.5 py-3 font-body text-[15px] leading-6 text-[color:var(--paper)] outline-none placeholder:text-[color:var(--paper-faint)]",
      className
    );

  if (props.as === "textarea") {
    const { as: _as, containerClassName, className, panelVariant = "elevated", ...rest } = props;
    const field = <textarea {...rest} className={cn(shared(className), "resize-none")} />;
    return panelVariant === "bare" ? (
      <div className={containerClassName}>{field}</div>
    ) : (
      <GlassPanel variant={panelVariant} className={containerClassName}>{field}</GlassPanel>
    );
  }

  const { as: _as, containerClassName, className, panelVariant = "elevated", ...rest } = props;
  const field = <input {...rest} className={shared(className)} />;
  return panelVariant === "bare" ? (
    <div className={containerClassName}>{field}</div>
  ) : (
    <GlassPanel variant={panelVariant} className={containerClassName}>{field}</GlassPanel>
  );
}

export function GlassChip({
  children,
  className,
  active = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "accent" | "sky" | "violet" | "amber";
  active?: boolean;
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-9 items-center justify-center border px-3 py-2",
        "font-mono text-[9px] font-medium uppercase tracking-[0.12em] transition-colors",
        "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-70",
        active
          ? "border-[color:var(--signal)] bg-[color:var(--signal)] text-[color:var(--ink)]"
          : "border-[color:var(--rule)] text-[color:var(--paper-muted)] hover:border-[color:var(--rule-strong)] hover:text-[color:var(--paper)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  color?: "default" | "cyan" | "amber" | "green" | "red";
}) {
  return (
    <div className="border-b border-[color:var(--rule)] py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--paper-faint)]">{label}</p>
          <p className="mt-1 font-mono text-sm text-[color:var(--paper)]">{value}</p>
        </div>
        {icon && <span className="text-[color:var(--signal)]">{icon}</span>}
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "web" | "paper" | "active" | "complete" | "error";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em]",
        variant === "error"
          ? "border-[color:var(--danger)] text-[color:var(--danger)]"
          : variant === "active"
            ? "border-[color:var(--signal)] text-[color:var(--signal)]"
            : "border-[color:var(--rule)] text-[color:var(--paper-faint)]"
      )}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[color:var(--signal)]">
      {children}
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 bg-[color:var(--signal)]"
          style={{ animation: "fadeUp 1s ease-in-out infinite", animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer bg-white/[0.055]", className)} />;
}
