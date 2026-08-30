"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  RefreshCw, 
  CreditCard, 
  ShieldAlert 
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import KpiCard from "@/components/KpiCard";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { AnalyticsOverview } from "@/lib/types";
import { formatINR, formatPercent } from "@/lib/utils";

const PIE_COLORS = ["#eab308", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsOverview();
      setData(res);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Analytics Error",
        message: err.message || "Failed to load analytics overview.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-yellow-400" />
            <span>Recovery & Disruption Analytics</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Comprehensive financial breakdown of payment failure patterns and recovery performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-yellow-400" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Disrupted Volume"
          value={data ? formatINR(data.total_failed_amount + data.total_recovered_amount) : "₹0"}
          subtitle="All payment attempt events"
          icon={ShieldAlert}
          variant="amber"
          loading={loading}
        />
        <KpiCard
          title="Recovered Revenue"
          value={data ? formatINR(data.total_recovered_amount) : "₹0"}
          subtitle={`${data?.total_recovered_count || 0} transactions recovered`}
          icon={DollarSign}
          variant="success"
          isPositive={true}
          loading={loading}
        />
        <KpiCard
          title="Revenue Remaining at Risk"
          value={data ? formatINR(data.total_failed_amount) : "₹0"}
          subtitle={`${data?.total_failed_count || 0} unresolved items`}
          icon={CreditCard}
          variant="danger"
          loading={loading}
        />
        <KpiCard
          title="Overall Recovery Rate"
          value={data ? formatPercent(data.overall_recovery_rate) : "0%"}
          subtitle="Historical success percentage"
          icon={TrendingUp}
          variant="yellow"
          loading={loading}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Line / Area Chart - Recovery Trend Over Time */}
        <div className="fintech-card p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>Recovery Trend Over Time</span>
            </h3>
            <span className="text-xs text-slate-400">Daily Timeline</span>
          </div>

          <div className="h-72 w-full pt-2">
            {loading ? (
              <div className="w-full h-full skeleton-pulse rounded-xl bg-slate-900/60" />
            ) : data && data.recovery_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.recovery_trends}>
                  <defs>
                    <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatINR(Number(value)), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey="recovered_amount"
                    name="Recovered Revenue (₹)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRecovered)"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed_amount"
                    name="Revenue at Risk (₹)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFailed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No timeline data available.</p>
            )}
          </div>
        </div>

        {/* Chart 2: Failure Reason Distribution Donut Chart */}
        <div className="fintech-card p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-yellow-400" />
              <span>Failure Cause Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Category Share</span>
          </div>

          <div className="h-72 w-full pt-2 flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full skeleton-pulse rounded-xl bg-slate-900/60" />
            ) : data && data.failure_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={data.failure_distribution}
                    dataKey="amount_at_risk"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {data.failure_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any) => [
                      `${formatINR(Number(value))}`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} layout="horizontal" align="center" verticalAlign="bottom" />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No category data available.</p>
            )}
          </div>
        </div>

        {/* Chart 3: Payment Method Performance Bar Chart */}
        <div className="lg:col-span-2 fintech-card p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-400" />
              <span>Payment Channel Recovery Performance</span>
            </h3>
            <span className="text-xs text-slate-400">Failed vs Recovered Volume</span>
          </div>

          <div className="h-80 w-full pt-2">
            {loading ? (
              <div className="w-full h-full skeleton-pulse rounded-xl bg-slate-900/60" />
            ) : data && data.payment_method_performance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.payment_method_performance}>
                  <XAxis dataKey="payment_method" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatINR(Number(value)), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="recovered_amount" name="Recovered Amount (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="failed_amount" name="Amount at Risk (₹)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No channel performance data available.</p>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
