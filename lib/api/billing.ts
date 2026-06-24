import apiClient from "./client";
import type { User } from "./types";

export interface PlanLimits {
  max_reminders: number;
  max_documents: number;
  max_family_members: number;
  chat_quota: number;
}

export interface PlanUsage {
  reminders: number;
  documents: number;
  family_members: number;
  chat_messages_used: number;
}

export interface CurrentPlanResponse {
  plan: User["plan"];
  limits?: PlanLimits;
  usage?: PlanUsage;
}

export async function getCurrentPlan(): Promise<CurrentPlanResponse> {
  const res = await apiClient.get<CurrentPlanResponse>("/billing/plan");
  return res.data;
}

/**
 * Create a checkout session for a plan upgrade.
 * Returns the URL to redirect the user to the payment provider.
 * Returns 501 if payment integration is not yet wired.
 */
export async function createCheckout(plan: User["plan"]): Promise<{ checkout_url: string }> {
  const res = await apiClient.post<{ checkout_url: string }>(
    "/billing/checkout",
    { plan },
  );
  return res.data;
}
