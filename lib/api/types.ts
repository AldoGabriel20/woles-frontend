// ─── Shared primitives ────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  error: string;
  message: string;
}

// ─── Auth / Identity ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatar_url: string | null;
  timezone: string;
  plan: "free" | "premium" | "advanced";
  account_status: "active" | "suspended" | "deleted";
  totp_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token_id: string;
  device_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  last_active_at: string;
  created_at: string;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export type ReminderCategory =
  | "bill"
  | "health"
  | "vehicle"
  | "insurance"
  | "subscription"
  | "tax"
  | "personal"
  | "work"
  | "family"
  | "custom";

export type RecurrenceType =
  | "once"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom_interval";

export type ReminderStatus = "active" | "paused" | "completed" | "cancelled";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  category: ReminderCategory;
  recurrence_type: RecurrenceType;
  recurrence_rule?: Record<string, unknown> | null;
  next_run_at: string;
  timezone: string;
  status: ReminderStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderRequest {
  title: string;
  category: ReminderCategory;
  recurrence_type: RecurrenceType;
  recurrence_rule?: Record<string, unknown>;
  next_run_at: string;
  timezone?: string;
}

export interface UpdateReminderRequest {
  title?: string;
  category?: ReminderCategory;
  recurrence_type?: RecurrenceType;
  recurrence_rule?: Record<string, unknown>;
  next_run_at?: string;
  timezone?: string;
}

export interface ReminderListParams {
  status?: ReminderStatus;
  category?: ReminderCategory;
  search?: string;
  sort?: "next_run_at" | "created_at";
  order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// ─── Documents ────────────────────────────────────────────────────────────────

export type VaultCategory =
  | "identity"
  | "vehicles"
  | "property"
  | "financial"
  | "health"
  | "education"
  | "insurance"
  | "legal"
  | "other";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  vault_category: VaultCategory;
  expiry_date: string | null;
  reminder_offsets: number[] | null;
  notes: string | null;
  file_url: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  title: string;
  document_type?: string;
  vault_category: VaultCategory;
  expiry_date?: string;
  reminder_offsets?: number[];
  notes?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  document_type?: string;
  vault_category?: VaultCategory;
  expiry_date?: string;
  reminder_offsets?: number[];
  notes?: string;
}

export interface DocumentListParams {
  vault_category?: VaultCategory;
  expiry_within_days?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface StorageUsage {
  used_bytes: number;
  used_mb: number;
  used_gb: number;
  file_count: number;
}

export interface VaultCategoryCount {
  category: VaultCategory;
  count: number;
}

export interface VaultHealth {
  categories: VaultCategoryCount[];
  completeness_score: number;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export type SubscriptionCategory =
  | "entertainment"
  | "productivity"
  | "health"
  | "education"
  | "finance"
  | "utilities"
  | "other";

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "archived";
export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string | null;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  amount: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date?: string;
  category: SubscriptionCategory;
  notes?: string;
}

export interface UpdateSubscriptionRequest {
  name?: string;
  amount?: number;
  currency?: string;
  billing_cycle?: BillingCycle;
  next_billing_date?: string;
  category?: SubscriptionCategory;
  notes?: string;
}

export interface SubscriptionListParams {
  status?: SubscriptionStatus;
  category?: SubscriptionCategory;
  page?: number;
  per_page?: number;
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "completed" | "archived" | "cancelled";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  icon: string | null;
  target_amount: number;
  current_amount: number;
  monthly_target: number | null;
  currency: string;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalRequest {
  title: string;
  icon?: string;
  target_amount: number;
  monthly_target?: number;
  currency: string;
  target_date?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  icon?: string;
  target_amount?: number;
  monthly_target?: number;
  currency?: string;
  target_date?: string;
}

export interface GoalListParams {
  status?: GoalStatus;
  page?: number;
  per_page?: number;
}

// ─── Finances ─────────────────────────────────────────────────────────────────

export interface FinancialSummary {
  total_monthly_cost: number;
  currency: string;
  subscription_count: number;
  active_goals: number;
  upcoming_bills: number;
}

export interface MonthlyCostItem {
  currency: string;
  total_amount: number;
  subscription_count: number;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string;
  type: "reminder" | "document" | "subscription" | "goal";
  title: string;
  due_at: string;
  status: string;
  entity_id: string;
}

export interface TimelineParams {
  range?: "7d" | "30d" | "90d" | "this_month" | "next_month";
  from?: string;
  to?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationStatus =
  | "pending"
  | "scheduled"
  | "sent"
  | "failed"
  | "cancelled";

export type NotificationEntityType =
  | "reminder"
  | "document"
  | "subscription"
  | "goal";

export interface Notification {
  id: string;
  user_id: string;
  entity_type: NotificationEntityType;
  entity_id: string;
  channel: string;
  status: NotificationStatus;
  scheduled_at: string;
  sent_at: string | null;
  retry_count: number;
  failure_reason: string | null;
}

export interface NotificationStats {
  total_sent: number;
  total_failed: number;
  delivery_rate_pct: number;
  top_category: string;
}

export interface NotificationListParams {
  status?: NotificationStatus;
  entity_type?: NotificationEntityType;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface NotificationExportParams {
  format: "csv" | "pdf";
  range?: string;
}

// ─── Family ───────────────────────────────────────────────────────────────────

export type FamilyRole = "spouse" | "child" | "parent" | "sibling" | "other";

export interface FamilyMember {
  id: string;
  owner_user_id: string;
  name: string;
  role: FamilyRole;
  relation_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFamilyMemberRequest {
  name: string;
  role: FamilyRole;
  relation_label?: string;
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  role?: FamilyRole;
  relation_label?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatUsage {
  messages_used: number;
  quota: number;
  remaining: number;
  plan_name: string;
}

export interface DetectedIntent {
  id: string;
  user_id: string;
  intent_type: string;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
}

// ─── Account ──────────────────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  name?: string;
  timezone?: string;
}
