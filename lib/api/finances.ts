import apiClient from "./client";
import type {
  FinancialSummary,
  MonthlyCostItem,
  PaginationMeta,
  SpendingByCategory,
  SpendingTrendWeek,
  UpcomingBill,
  UpcomingBillsParams,
} from "./types";

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

export async function getSpendingByCategory(
  period = "monthly",
): Promise<SpendingByCategory[] | null> {
  const res = await apiClient.get<{ categories: SpendingByCategory[] | null }>(
    "/finances/spending",
    { params: { period } },
  );
  return res.data.categories;
}

export async function getSpendingTrend(
  period = "weekly",
): Promise<SpendingTrendWeek[] | null> {
  const res = await apiClient.get<{ weeks: SpendingTrendWeek[] | null }>(
    "/finances/trend",
    { params: { period } },
  );
  return res.data.weeks;
}

export async function getUpcomingBills(
  params?: UpcomingBillsParams,
): Promise<{ bills: UpcomingBill[] | null; meta: PaginationMeta }> {
  const res = await apiClient.get<{
    bills: UpcomingBill[] | null;
    meta: PaginationMeta;
  }>("/finances/upcoming-bills", { params });
  return res.data;
}

export async function exportFinances(
  format: "csv" | "pdf" | "excel",
): Promise<Blob> {
  const res = await apiClient.get<ArrayBuffer>("/finances/export", {
    params: { format },
    responseType: "arraybuffer",
  });
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  };
  return new Blob([res.data], { type: mimeMap[format] ?? "text/csv" });
}

