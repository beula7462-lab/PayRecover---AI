import {
  DashboardMetrics,
  DashboardInsights,
  PaginatedTransactions,
  TransactionDetailResponse,
  RecoveryActionResponse,
  AIQueueItem,
  AnalyticsOverview,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = "An unexpected API error occurred.";
    try {
      const errBody = await res.json();
      if (errBody.detail) {
        errorDetail = errBody.detail;
      }
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboardMetrics: (): Promise<DashboardMetrics> => {
    return fetchJson<DashboardMetrics>(`${API_BASE_URL}/dashboard/metrics`, { cache: "no-store" });
  },

  getDashboardInsights: (): Promise<DashboardInsights> => {
    return fetchJson<DashboardInsights>(`${API_BASE_URL}/dashboard/insights`, { cache: "no-store" });
  },

  // Transactions
  getTransactions: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    payment_method?: string;
    failure_reason?: string;
    search?: string;
    sort_by?: string;
    sort_dir?: string;
  }): Promise<PaginatedTransactions> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.page_size) query.append("page_size", params.page_size.toString());
    if (params?.status) query.append("status", params.status);
    if (params?.payment_method) query.append("payment_method", params.payment_method);
    if (params?.failure_reason) query.append("failure_reason", params.failure_reason);
    if (params?.search) query.append("search", params.search);
    if (params?.sort_by) query.append("sort_by", params.sort_by);
    if (params?.sort_dir) query.append("sort_dir", params.sort_dir);

    return fetchJson<PaginatedTransactions>(`${API_BASE_URL}/transactions?${query.toString()}`, { cache: "no-store" });
  },

  getTransactionDetail: (id: string): Promise<TransactionDetailResponse> => {
    return fetchJson<TransactionDetailResponse>(`${API_BASE_URL}/transactions/${id}`, { cache: "no-store" });
  },

  // Recovery Queue & Actions
  getRecoveryQueue: (): Promise<AIQueueItem[]> => {
    return fetchJson<AIQueueItem[]>(`${API_BASE_URL}/recovery-queue`, { cache: "no-store" });
  },

  executeRecovery: (
    id: string,
    action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER",
    notes?: string
  ): Promise<RecoveryActionResponse> => {
    return fetchJson<RecoveryActionResponse>(`${API_BASE_URL}/transactions/${id}/recover`, {
      method: "POST",
      body: JSON.stringify({ action, notes }),
    });
  },

  // Analytics
  getAnalyticsOverview: (): Promise<AnalyticsOverview> => {
    return fetchJson<AnalyticsOverview>(`${API_BASE_URL}/analytics/overview`, { cache: "no-store" });
  },
};
