"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Bot, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Info 
} from "lucide-react";
import KpiCard from "@/components/KpiCard";
import ProbabilityBadge from "@/components/ProbabilityBadge";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { DashboardMetrics, DashboardInsights, AIQueueItem, InsightItem } from "@/lib/types";
import { formatINR, formatPercent, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [topQueue, setTopQueue] = useState<AIQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, i, q] = await Promise.all([
        api.getDashboardMetrics(),
        api.getDashboardInsights(),
        api.getRecoveryQueue(),
      ]);
      setMetrics(m);
      setInsights(i);
      setTopQueue(q.slice(0, 5));
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Dashboard Data Error",
        message: err.message || "Failed to load dashboard metrics.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleQuickExecute = async (txnId: string, action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER") => {
    setExecutingId(txnId);
    try {
      const res = await api.executeRecovery(txnId, action);
      setToast({
        id: Date.now().toString(),
        type: res.status === "SUCCESS" ? "success" : "info",
        title: `Recovery Executed (${action})`,
        message: res.result,
      });
      // Refresh dashboard metrics & queue state dynamically
      await loadDashboardData();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Execution Failed",
        message: err.message || "Action could not be completed.",
      });
    } finally {
      setExecutingId(null);
    }
  };

  const getInsightIcon = (type: string, severity: string) => {
    if (severity === "CRITICAL") return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (severity === "WARNING") return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    if (severity === "SUCCESS") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    return <Info className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Recovery Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Dynamic AI
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time digital payment failure analytics and automated recovery engine performance.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-yellow-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Revenue at Risk"
          value={metrics ? formatINR(metrics.revenue_at_risk) : "₹0"}
          subtitle="Unresolved failed payment sum"
          icon={ShieldAlert}
          variant="danger"
          loading={loading}
        />
        <KpiCard
          title="Revenue Recovered"
          value={metrics ? formatINR(metrics.revenue_recovered) : "₹0"}
          subtitle="Successfully recaptured revenue"
          icon={DollarSign}
          variant="success"
          isPositive={true}
          loading={loading}
        />
        <KpiCard
          title="Recovery Rate"
          value={metrics ? formatPercent(metrics.recovery_rate) : "0%"}
          subtitle="Recovered / Total recoverable"
          icon={TrendingUp}
          variant="yellow"
          loading={loading}
        />
        <KpiCard
          title="Failed Payments"
          value={metrics ? metrics.failed_payments.toString() : "0"}
          subtitle="Pending recovery actions"
          icon={AlertCircle}
          variant="amber"
          loading={loading}
        />
      </div>

      {/* Main Grid: AI Insights Feed + Priority Queue Quick Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Dynamic DB AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="fintech-card p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    AI Insights & Signals
                  </h2>
                  <p className="text-xs text-slate-400">
                    Engineered from active PostgreSQL transaction patterns
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-yellow-300 bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/30">
                LIVE DB FEED
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 skeleton-pulse h-20" />
                ))}
              </div>
            ) : insights && insights.insights.length > 0 ? (
              <div className="space-y-4">
                {insights.insights.map((insight: InsightItem) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-yellow-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 mt-0.5 sm:mt-0">
                        {getInsightIcon(insight.type, insight.severity)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {insight.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {insight.target_transaction_id && (
                      <Link
                        href={`/transactions/${insight.target_transaction_id}`}
                        className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap"
                      >
                        <span>{insight.action_label || "Analyze"}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No current alerts detected.</p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Top Priority Recovery Actions */}
        <div className="space-y-6">
          <div className="fintech-card p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Top Priority Queue
                </h3>
              </div>
              <Link
                href="/recovery-queue"
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
              >
                <span>View Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 skeleton-pulse h-16" />
                ))}
              </div>
            ) : topQueue.length > 0 ? (
              <div className="space-y-3">
                {topQueue.map((item) => {
                  const txn = item.transaction;
                  const isExecuting = executingId === txn.transaction_id;

                  return (
                    <div
                      key={txn.transaction_id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-yellow-500/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/transactions/${txn.transaction_id}`}
                            className="font-bold text-xs text-white hover:text-yellow-300 transition-colors"
                          >
                            {txn.customer_name}
                          </Link>
                          <p className="text-[11px] font-mono text-slate-400">{txn.transaction_id}</p>
                        </div>
                        <span className="text-sm font-extrabold text-white">
                          {formatINR(txn.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                        <PriorityBadge priority={txn.priority} />
                        <ProbabilityBadge probability={txn.recovery_probability} size="sm" />
                      </div>

                      <button
                        onClick={() => handleQuickExecute(txn.transaction_id, txn.recommended_action)}
                        disabled={isExecuting}
                        className="w-full mt-1 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-yellow-500/25 active:scale-98 disabled:opacity-50"
                      >
                        <Zap className={`w-3.5 h-3.5 fill-slate-950 ${isExecuting ? "animate-spin" : ""}`} />
                        <span>
                          {isExecuting ? "Executing..." : `Execute: ${txn.recommended_action.replace("_", " ")}`}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">All failed transactions resolved!</p>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
