import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "LOW":
      return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/30";
  }
}

export function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "RECOVERED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "PENDING_RECOVERY":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "ACTION_EXECUTED":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    case "FAILED":
    default:
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  }
}
