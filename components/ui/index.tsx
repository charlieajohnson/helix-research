"use client";

import { ReactNode } from "react";

// ── Glass Panel ────────────────────────────────────────────────────────────────

export function GlassPanel({
  children,
  className = "",
  bright = false,
}: {
  children: ReactNode;
  className?: string;
  bright?: boolean;
}) {
  return (
    <div
      className={`
        ${bright ? "glass-bright" : "glass"}
        rounded-panel
        ${className}
      `}
    >
      {children}
    </div>
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
    default: "text-slate-200",
    cyan: "text-teal-400",
    amber: "text-amber-400",
    green: "text-emerald-400",
    red: "text-red-400",
  };

  return (
    <div className="glass rounded-card p-3 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className={`font-mono text-sm font-medium ${colorClasses[color]}`}>
        {value}
      </div>
    </div>
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
    default: "bg-slate-800/50 text-slate-400 border-slate-700/50",
    web: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    paper: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    active: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    complete: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px]
        font-mono font-medium uppercase tracking-wider border
        ${classes[variant]}
      `}
    >
      {children}
    </span>
  );
}

// ── Section Label ──────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
      {children}
    </div>
  );
}

// ── Loading Dots ───────────────────────────────────────────────────────────────

export function LoadingDots() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-teal-400"
          style={{
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
