"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: "danger" | "success" | "indigo" | "amber";
  loading?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  variant = "indigo",
  loading = false,
}: KpiCardProps) {
  const variantStyles = {
    danger: {
      bg: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      text: "text-rose-400",
    },
    success: {
      bg: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      text: "text-emerald-400",
    },
    indigo: {
      bg: "from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20",
      iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      text: "text-indigo-400",
    },
    amber: {
      bg: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      text: "text-amber-400",
    },
  };

  const style = variantStyles[variant];

  if (loading) {
    return (
      <div className="fintech-card p-6 rounded-2xl border skeleton-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-10 w-10 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-8 w-36 bg-slate-800 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fintech-card fintech-card-hover p-6 rounded-2xl border bg-gradient-to-br relative overflow-hidden transition-all duration-200",
        style.bg
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl border flex items-center justify-center shadow-sm", style.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </h3>

        {change && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}
