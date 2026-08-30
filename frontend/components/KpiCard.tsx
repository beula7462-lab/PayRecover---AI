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
  variant?: "danger" | "success" | "yellow" | "amber";
  loading?: boolean;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  variant = "yellow",
  loading = false,
}: KpiCardProps) {
  const variantStyles = {
    danger: {
      bg: "from-rose-50/80 via-rose-50/40 to-white border-rose-200",
      iconBg: "bg-rose-100 text-rose-600 border-rose-200",
      text: "text-rose-600",
    },
    success: {
      bg: "from-emerald-50/80 via-emerald-50/40 to-white border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-600 border-emerald-200",
      text: "text-emerald-600",
    },
    yellow: {
      bg: "from-yellow-100/70 via-yellow-50/40 to-white border-yellow-300",
      iconBg: "bg-yellow-400 text-slate-950 border-yellow-500/40",
      text: "text-yellow-700",
    },
    amber: {
      bg: "from-amber-50/80 via-amber-50/40 to-white border-amber-200",
      iconBg: "bg-amber-100 text-amber-700 border-amber-200",
      text: "text-amber-700",
    },
  };

  const style = variantStyles[variant];

  if (loading) {
    return (
      <div className="fintech-card p-6 rounded-2xl border skeleton-pulse bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-10 w-10 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-8 w-36 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-200 rounded" />
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
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        <div className={cn("p-2.5 rounded-xl border flex items-center justify-center shadow-xs font-bold", style.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>

        {change && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border",
              isPositive
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-rose-100 text-rose-700 border-rose-200"
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

      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}
