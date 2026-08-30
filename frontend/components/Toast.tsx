"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: "bg-white border-emerald-400 text-slate-900 shadow-xl",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    error: {
      bg: "bg-white border-rose-400 text-slate-900 shadow-xl",
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    },
    info: {
      bg: "bg-white border-yellow-400 text-slate-900 shadow-xl",
      icon: <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />,
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md w-full">
      <div
        className={cn(
          "p-4 rounded-2xl border shadow-xl flex items-start gap-3 bg-white",
          config.bg
        )}
      >
        {config.icon}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{toast.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
    </div>
  );
}
