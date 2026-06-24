import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGoal,
  deleteGoal,
  getGoal,
  listGoalHistory,
  listGoals,
  updateGoal,
  updateGoalProgress,
} from "@/lib/api/goals";
import type { CreateGoalRequest, GoalListParams, UpdateGoalRequest } from "@/lib/api/types";

export function useGoals(params?: GoalListParams) {
  return useQuery({
    queryKey: ["goals", params ?? {}],
    queryFn: () => listGoals(params),
    staleTime: 30_000,
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ["goals", id],
    queryFn: () => getGoal(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useGoalHistory(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["goals", "history", params ?? {}],
    queryFn: () => listGoalHistory(params),
    staleTime: 30_000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalRequest) => createGoal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      updateGoal(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["goals", id] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      updateGoalProgress(id, amount),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["goals", id] });
    },
  });
}
