"use client";

import { Search, Bell, IndianRupee, Cpu } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-800/70 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left Title / Search */}
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs font-semibold text-yellow-300">
          <Cpu className="w-3.5 h-3.5 text-yellow-400" />
          <span>AI Engine: Deterministic Scoring v1.0</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Currency Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium">
          <IndianRupee className="w-3.5 h-3.5 text-yellow-400" />
          <span>INR (₹)</span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-yellow-500/40 flex items-center justify-center font-bold text-xs text-yellow-400 shadow-sm">
            PA
          </div>
          <div className="hidden md:block text-xs text-left">
            <p className="font-semibold text-white">Revenue Ops</p>
            <p className="text-slate-400 text-[10px]">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
