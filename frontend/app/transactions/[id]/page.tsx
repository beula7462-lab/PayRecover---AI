"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Zap, 
  Send, 
  Calendar, 
  AlertCircle, 
  Bot, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  History, 
  FileText 
} from "lucide-react";
import ProbabilityBadge from "@/components/ProbabilityBadge";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { TransactionDetailResponse } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";

export default function TransactionAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const txnId = params.id as string;

  const [detail, setDetail] = useState<TransactionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER" | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadDetail = useCallback(async () => {
    if (!txnId) return;
    setLoading(true);
    try {
      const res = await api.getTransactionDetail(txnId);
      setDetail(res);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Transaction Error",
        message: err.message || "Failed to load transaction details.",
      });
    } finally {
      setLoading(false);
    }
  }, [txnId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleExecuteAction = async () => {
    if (!selectedAction || !txnId) return;
    setExecuting(true);
    try {
      const res = await api.executeRecovery(txnId, selectedAction, notesInput || undefined);
      setToast({
        id: Date.now().toString(),
        type: res.status === "SUCCESS" ? "success" : "info",
        title: `Action Executed (${selectedAction})`,
        message: res.result,
      });
      setSelectedAction(null);
      setNotesInput("");
      await loadDetail();
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Execution Error",
        message: err.message || "Action failed to execute.",
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded skeleton-pulse" />
        <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800 skeleton-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 skeleton-pulse" />
          <div className="h-64 bg-slate-900/60 rounded-2xl border border-slate-800 skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Transaction Not Found</h2>
        <p className="text-sm text-slate-400">Transaction ID &apos;{txnId}&apos; could not be located in database.</p>
        <Link
          href="/payments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-extrabold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Link>
      </div>
    );
  }

  const txn = detail.transaction;
  const ai = detail.ai_analysis;
  const isRecovered = txn.status === "RECOVERED";

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {txn.transaction_id}
              </h1>
              <StatusBadge status={txn.status} />
              <PriorityBadge priority={txn.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Customer: <span className="text-slate-900 font-bold">{txn.customer_name}</span> • Created {formatDate(txn.transaction_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & AI Probability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Parameters + AI Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Parameters Overview Card */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Amount at Risk</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatINR(txn.amount)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Payment Method</span>
              <p className="text-sm font-bold text-yellow-900 mt-1">{txn.payment_method}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Attempt Count</span>
              <p className="text-sm font-bold text-amber-700 mt-1">{txn.attempt_count} attempts</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Priority Score</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">{txn.priority_score} / 100</p>
            </div>
          </div>

          {/* Disruption Analysis & AI Explanation Card */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <Bot className="w-5 h-5 text-yellow-600" />
              <h2 className="text-base font-extrabold text-slate-900">AI Disruption Diagnosis & Recommendations</h2>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">Root Cause: {txn.failure_reason}</h4>
                <p className="text-xs text-rose-800/90 mt-1 leading-relaxed font-medium">
                  Payment processor rejected execution. AI model identified error classification pattern and computed recovery plan.
                </p>
              </div>
            </div>

            {/* AI Explanation Bullet Points */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                Scoring Engine Explainability Logic
              </h4>

              <ul className="space-y-2">
                {ai.explanation.map((exp, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Historical Actions Timeline */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <History className="w-4 h-4 text-yellow-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Recovery Execution Log History</h3>
            </div>

            {detail.recovery_history.length > 0 ? (
              <div className="space-y-3">
                {detail.recovery_history.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{log.action_type}</span>
                      <p className="text-slate-500 text-[11px] font-medium">{log.result}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {log.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(log.executed_at || "")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 font-medium">No prior recovery actions executed.</p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Radial Probability Score & Execution Toolbar */}
        <div className="space-y-6">
          {/* Probability Indicator Card */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              AI Estimated Probability
            </h3>

            <div className="py-2 flex justify-center">
              <ProbabilityBadge probability={ai.recovery_probability} size="lg" showRing={true} />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Model Confidence</span>
                <span className="text-slate-900 font-extrabold">{Math.round(ai.confidence_score * 100)}%</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Recommended Action</span>
                <span className="text-yellow-900 font-extrabold">{ai.recommended_action}</span>
              </div>
            </div>
          </div>

          {/* Action Execution Panel */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span>Execute Recovery Workflow</span>
            </h3>

            {isRecovered ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="font-extrabold">Transaction Successfully Recovered</p>
                <p className="text-emerald-700 text-[11px] font-medium">This transaction has been resolved and no further actions are required.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedAction("RETRY_PAYMENT")}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                    ai.recommended_action === "RETRY_PAYMENT"
                      ? "bg-yellow-100/80 border-yellow-400 text-slate-950 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-slate-900 font-extrabold">Retry Payment (Auto-Submit)</p>
                      <p className="text-[10px] text-slate-500 font-normal">Ideal for transient bank errors</p>
                    </div>
                  </div>
                  {ai.recommended_action === "RETRY_PAYMENT" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 border border-yellow-500">
                      AI Choice
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSelectedAction("SEND_PAYMENT_LINK")}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                    ai.recommended_action === "SEND_PAYMENT_LINK"
                      ? "bg-yellow-100/80 border-yellow-400 text-slate-950 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-slate-900 font-extrabold">Send Payment Link</p>
                      <p className="text-[10px] text-slate-500 font-normal">SMS / WhatsApp / Email smart link</p>
                    </div>
                  </div>
                  {ai.recommended_action === "SEND_PAYMENT_LINK" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 border border-yellow-500">
                      AI Choice
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSelectedAction("SCHEDULE_REMINDER")}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                    ai.recommended_action === "SCHEDULE_REMINDER"
                      ? "bg-yellow-100/80 border-yellow-400 text-slate-950 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-slate-900 font-extrabold">Schedule Automated Reminder</p>
                      <p className="text-[10px] text-slate-500 font-normal">Delay retry to avoid spamming</p>
                    </div>
                  </div>
                  {ai.recommended_action === "SCHEDULE_REMINDER" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 border border-yellow-500">
                      AI Choice
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fintech-card p-6 rounded-2xl border border-slate-200 bg-white max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-yellow-600">
              <Zap className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-slate-900">Confirm Recovery Action</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You are executing <strong className="text-yellow-900 font-extrabold">{selectedAction}</strong> for customer{" "}
              <strong className="text-slate-900 font-extrabold">{txn.customer_name}</strong> ({formatINR(txn.amount)}).
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Execution Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Manual authorization trigger by operator"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAction(null)}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={executing}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md shadow-yellow-400/30"
              >
                {executing ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin fill-slate-950" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Confirm & Execute</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
