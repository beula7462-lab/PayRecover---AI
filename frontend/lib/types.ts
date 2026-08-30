export interface Transaction {
  id: number;
  transaction_id: string;
  customer_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  failure_reason: string;
  status: "FAILED" | "PENDING_RECOVERY" | "RECOVERED" | "ACTION_EXECUTED";
  attempt_count: number;
  transaction_date: string;
  recovery_probability: number;
  priority_score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommended_action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER";
  created_at: string;
  updated_at: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AIScoringDetail {
  recovery_probability: number;
  priority_score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommended_action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER";
  explanation: string[];
  confidence_score: number;
}

export interface AIQueueItem {
  transaction: Transaction;
  scoring_detail: AIScoringDetail;
}

export interface RecoveryActionLog {
  id: number;
  action_type: string;
  status: string;
  result: string;
  notes?: string;
  executed_at?: string;
}

export interface TransactionDetailResponse {
  transaction: Transaction;
  ai_analysis: AIScoringDetail;
  recovery_history: RecoveryActionLog[];
}

export interface RecoveryActionRequest {
  action: "RETRY_PAYMENT" | "SEND_PAYMENT_LINK" | "SCHEDULE_REMINDER";
  notes?: string;
}

export interface RecoveryActionResponse {
  id: number;
  transaction_id: string;
  action_type: string;
  status: string;
  result: string;
  notes?: string;
  executed_at: string;
  updated_transaction: Transaction;
}

export interface DashboardMetrics {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  failed_payments: number;
  total_transactions: number;
}

export interface InsightItem {
  id: string;
  type: "HIGH_VALUE" | "FREQUENT_FAILURE" | "HIGH_PROBABILITY" | "METHOD_ALERT" | "SUMMARY";
  title: string;
  description: string;
  impact: string;
  action_label?: string;
  target_transaction_id?: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";
}

export interface DashboardInsights {
  generated_at: string;
  insights: InsightItem[];
}

export interface TrendPoint {
  date: string;
  failed_amount: number;
  recovered_amount: number;
  recovery_rate: number;
}

export interface FailureDistribution {
  reason: string;
  count: number;
  amount_at_risk: number;
  percentage: number;
}

export interface PaymentMethodPerformance {
  payment_method: string;
  total_count: number;
  failed_amount: number;
  recovered_amount: number;
  recovery_rate: number;
}

export interface AnalyticsOverview {
  total_failed_amount: number;
  total_recovered_amount: number;
  overall_recovery_rate: number;
  total_failed_count: number;
  total_recovered_count: number;
  recovery_trends: TrendPoint[];
  failure_distribution: FailureDistribution[];
  payment_method_performance: PaymentMethodPerformance[];
}
