import apiClient from "./client";
import type { FinancialSummary, MonthlyCostItem } from "./types";

export async function getFinancialSummary(): Promise<FinancialSummary | null> {
  const res = await apiClient.get<{ summary: FinancialSummary | null }>(
    "/finances/summary",
  );
  return res.data.summary;
}

export async function getMonthlyCosts(): Promise<MonthlyCostItem[] | null> {
  const res = await apiClient.get<{ monthly_costs: MonthlyCostItem[] | null }>(
    "/finances/monthly-costs",
  );
  return res.data.monthly_costs;
}
