"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Bot, 
  Zap, 
  Send, 
  Calendar, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  SlidersHorizontal 
} from "lucide-react";
import ProbabilityBadge from "@/components/ProbabilityBadge";
import PriorityBadge from "@/components/PriorityBadge";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { AIQueueItem } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";

export default function RecoveryQueuePage() {
  const [queue, setQueue] = useState<AIQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRecoveryQueue();
      setQueue(res);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Queue Load Error",
        message: err.message || "Failed to load recovery queue.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleExecute = async (
    txnId: string,
    action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER"
  ) => {
    setExecutingId(txnId);
    try {
      const res = await api.executeRecovery(txnId, action);
      setToast({
        id: Date.now().toString(),
        type: res.status === "SUCCESS" ? "success" : "info",
        title: `Action Executed (${action})`,
        message: res.result,
      });
      // Re-fetch queue dynamically
      await fetchQueue();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Action Execution Error",
        message: err.message || "Failed to execute recovery action.",
      });
    } finally {
      setExecutingId(null);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filterPriority === "ALL") return true;
    return item.transaction.priority === filterPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Bot className="w-8 h-8 text-indigo-400" />
              <span>AI Autonomous Recovery Queue</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Ranked by Priority Score
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Highest revenue value & recovery probability transactions automatically prioritized first.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Re-Rank Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="fintech-card p-4 rounded-2xl border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1" />
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterPriority === p
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {p === "ALL" ? `All Unresolved (${queue.length})` : `${p} Priority`}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing <strong className="text-white">{filteredQueue.length}</strong> prioritized items
        </span>
      </div>

      {/* Queue Items Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="fintech-card p-6 rounded-2xl border skeleton-pulse h-36" />
          ))}
        </div>
      ) : filteredQueue.length > 0 ? (
        <div className="space-y-4">
          {filteredQueue.map((item) => {
            const txn = item.transaction;
            const ai = item.scoring_detail;
            const isExecuting = executingId === txn.transaction_id;

            return (
              <div
                key={txn.transaction_id}
                className="fintech-card fintech-card-hover p-6 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
              >
                {/* Left Side: Priority Indicator & Details */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <PriorityBadge priority={txn.priority} />
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {txn.transaction_id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Customer: <strong className="text-white">{txn.customer_name}</strong>
                    </span>
                    <span className="text-xs text-slate-500">• {formatDate(txn.transaction_date)}</span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-4">
                    <h3 className="text-2xl font-extrabold text-white">
                      {formatINR(txn.amount)}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Method:</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200">
                        {txn.payment_method}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Failure:</span>
                      <span className="text-xs font-medium text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {txn.failure_reason}
                      </span>
                    </div>
                  </div>

                  {/* AI Recommendation Summary */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Bot className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>Recommended: <strong className="text-indigo-300 font-bold">{txn.recommended_action.replace("_", " ")}</strong></span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Score: {txn.priority_score}/100
                    </span>
                  </div>
                </div>

                {/* Right Side: Probability Gauge & Direct Action Toolbar */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  <ProbabilityBadge probability={txn.recovery_probability} size="md" showRing={true} />

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/transactions/${txn.transaction_id}`}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Link>

                    <button
                      onClick={() => handleExecute(txn.transaction_id, "RETRY_PAYMENT")}
                      disabled={isExecuting}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isExecuting ? "animate-spin" : ""}`} />
                      <span>Retry Payment</span>
                    </button>

                    <button
                      onClick={() => handleExecute(txn.transaction_id, "SEND_PAYMENT_LINK")}
                      disabled={isExecuting}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Link</span>
                    </button>

                    <button
                      onClick={() => handleExecute(txn.transaction_id, "SCHEDULE_REMINDER")}
                      disabled={isExecuting}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reminder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="fintech-card p-12 rounded-2xl border text-center space-y-3">
          <Bot className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Queue Empty!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All failed transactions have been successfully recovered or processed. Great job!
          </p>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
