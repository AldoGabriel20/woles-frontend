import { useQuery } from "@tanstack/react-query";
import {
  getFinancialSummary,
  getMonthlyCosts,
  getSpendingByCategory,
  getSpendingTrend,
  getUpcomingBills,
} from "@/lib/api/finances";
import type { UpcomingBillsParams } from "@/lib/api/types";

export function useFinancialSummary() {
  return useQuery({
    queryKey: ["finances", "summary"],
    queryFn: getFinancialSummary,
    staleTime: 60_000,
  });
}

export function useMonthlyCosts() {
  return useQuery({
    queryKey: ["finances", "monthly-costs"],
    queryFn: getMonthlyCosts,
    staleTime: 60_000,
  });
}

export function useSpendingBreakdown(period = "monthly") {
  return useQuery({
    queryKey: ["finances", "spending", period],
    queryFn: () => getSpendingByCategory(period),
    staleTime: 60_000,
  });
}

export function useSpendingTrend(period = "weekly") {
  return useQuery({
    queryKey: ["finances", "trend", period],
    queryFn: () => getSpendingTrend(period),
    staleTime: 60_000,
  });
}

export function useUpcomingBills(params?: UpcomingBillsParams) {
  return useQuery({
    queryKey: ["finances", "upcoming-bills", params ?? {}],
    queryFn: () => getUpcomingBills(params),
    staleTime: 30_000,
  });
}
