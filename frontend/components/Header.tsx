"use client";

import { Search, Bell, IndianRupee, Cpu } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Left Title / Search */}
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-100 border border-yellow-300 text-xs font-bold text-yellow-900">
          <Cpu className="w-3.5 h-3.5 text-yellow-700" />
          <span>AI Engine: Deterministic Scoring v1.0</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Currency Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold">
          <IndianRupee className="w-3.5 h-3.5 text-yellow-600" />
          <span>INR (₹)</span>
        </div>

        {/* Notification Bell */}
        <button className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-500" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 border border-yellow-500 flex items-center justify-center font-extrabold text-xs text-slate-950 shadow-sm">
            PA
          </div>
          <div className="hidden md:block text-xs text-left">
            <p className="font-bold text-slate-900">Revenue Ops</p>
            <p className="text-slate-500 text-[10px]">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
