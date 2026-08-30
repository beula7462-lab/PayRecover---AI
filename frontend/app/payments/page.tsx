"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CreditCard, 
  RefreshCw 
} from "lucide-react";
import ProbabilityBadge from "@/components/ProbabilityBadge";
import PriorityBadge from "@/components/PriorityBadge";
import StatusBadge from "@/components/StatusBadge";
import Toast, { ToastMessage } from "@/components/Toast";
import { api } from "@/lib/api";
import { PaginatedTransactions, Transaction } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";

const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"];
const FAILURE_REASONS = [
  "Temporary Bank Error",
  "Insufficient Funds",
  "Network Error",
  "Expired Card",
  "Invalid Payment Details",
  "Bank Declined",
  "Timeout",
];
const STATUS_OPTIONS = ["FAILED", "PENDING_RECOVERY", "RECOVERED", "ACTION_EXECUTED"];

export default function PaymentsPage() {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [sortBy, setSortBy] = useState("transaction_date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        page,
        page_size: 10,
        status: status || undefined,
        payment_method: paymentMethod || undefined,
        failure_reason: failureReason || undefined,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      setData(res);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Fetch Error",
        message: err.message || "Failed to load payment transactions.",
      });
    } finally {
      setLoading(false);
    }
  }, [page, status, paymentMethod, failureReason, search, sortBy, sortDir]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentMethod("");
    setFailureReason("");
    setSortBy("transaction_date");
    setSortDir("desc");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-yellow-600" />
            <span>Failed Payment Transactions</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Search, filter, and inspect detailed payment disruption logs.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-yellow-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-yellow-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="fintech-card p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search customer name or TXN ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-yellow-400 transition-colors shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-yellow-400 shadow-xs"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-yellow-400 shadow-xs"
          >
            <option value="">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Failure Reason Filter */}
          <select
            value={failureReason}
            onChange={(e) => {
              setFailureReason(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-yellow-400 shadow-xs"
          >
            <option value="">All Failure Reasons</option>
            {FAILURE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {(search || status || paymentMethod || failureReason || sortBy !== "transaction_date") && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="text-yellow-700 hover:text-yellow-900 font-extrabold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="fintech-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4">Method</th>
                <th className="p-4">Failure Reason</th>
                <th className="p-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort("transaction_date")}>
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort("recovery_probability")}>
                  <div className="flex items-center gap-1">
                    <span>Probability</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="skeleton-pulse">
                    <td colSpan={10} className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : data && data.items.length > 0 ? (
                data.items.map((txn: Transaction) => (
                  <tr
                    key={txn.transaction_id}
                    className="hover:bg-yellow-50/50 transition-colors group"
                  >
                    <td className="p-4 font-mono font-extrabold text-yellow-900">
                      {txn.transaction_id}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {txn.customer_name}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      {formatINR(txn.amount)}
                    </td>
                    <td className="p-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold">
                        {txn.payment_method}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate font-medium">
                      {txn.failure_reason}
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap font-medium">
                      {formatDate(txn.transaction_date)}
                    </td>
                    <td className="p-4">
                      <ProbabilityBadge probability={txn.recovery_probability} size="sm" />
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={txn.priority} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/transactions/${txn.transaction_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-950" />
                        <span>Analyze</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No failed payments found.</p>
                    <p className="text-xs mt-1">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.total_pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <strong className="text-slate-900">{data.page}</strong> of <strong className="text-slate-900">{data.total_pages}</strong> ({data.total} Total)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
