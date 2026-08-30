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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 shadow-md"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-sm",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-500/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                PayRecover <span className="text-yellow-500 font-extrabold">AI</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
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
                    "flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-150 group",
                    isActive
                      ? "bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-yellow-50/70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border",
                        isActive
                          ? "bg-slate-950 text-yellow-400 border-slate-900"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Agent Status Card */}
        <div className="p-4 m-4 rounded-xl bg-yellow-50/60 border border-yellow-200/80 text-xs">
          <div className="flex items-center gap-2 text-yellow-800 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-yellow-600" />
            <span>Synthetic Safety Mode</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Operating with simulated transactions & INR currency. No real cards processed.
          </p>
        </div>
      </aside>
    </>
  );
}
