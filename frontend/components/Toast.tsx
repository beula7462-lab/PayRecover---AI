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
      bg: "bg-slate-900 border-emerald-500/40 text-emerald-400",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    },
    error: {
      bg: "bg-slate-900 border-rose-500/40 text-rose-400",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    },
    info: {
      bg: "bg-slate-900 border-yellow-500/40 text-yellow-400",
      icon: <Info className="w-5 h-5 text-yellow-400 flex-shrink-0" />,
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md w-full">
      <div
        className={cn(
          "p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-xl",
          config.bg
        )}
      >
        {config.icon}
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-sm font-bold text-white tracking-tight">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
