"use client";

import { getStatusColor, cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || "FAILED";

  const getIcon = () => {
    switch (normalized) {
      case "RECOVERED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "PENDING_RECOVERY":
        return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      case "ACTION_EXECUTED":
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      case "FAILED":
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case "RECOVERED":
        return "Recovered";
      case "PENDING_RECOVERY":
        return "Pending Recovery";
      case "ACTION_EXECUTED":
        return "Action Executed";
      case "FAILED":
      default:
        return "Failed";
    }
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5",
        getStatusColor(normalized),
        className
      )}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
}
