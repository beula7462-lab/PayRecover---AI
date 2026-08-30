"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Bot, 
  BarChart3, 
  ShieldAlert, 
  Zap, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Failed Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "AI Recovery Queue",
    href: "/recovery-queue",
    icon: Bot,
    badge: "Prioritized",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-300 hover:text-white backdrop-blur-md shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out backdrop-blur-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
                PayRecover <span className="text-indigo-400 font-extrabold">AI</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Revenue Agent Active
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-150 group",
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 hover:border hover:border-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Agent Status Card */}
        <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Synthetic Safety Mode</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Operating with simulated transactions & INR currency. No real cards processed.
          </p>
        </div>
      </aside>
    </>
  );
}
