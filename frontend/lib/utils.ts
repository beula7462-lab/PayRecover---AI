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
      return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    case "LOW":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "RECOVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
    case "PENDING_RECOVERY":
      return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    case "ACTION_EXECUTED":
      return "bg-yellow-100 text-yellow-900 border-yellow-400 font-extrabold";
    case "FAILED":
    default:
      return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
  }
}
