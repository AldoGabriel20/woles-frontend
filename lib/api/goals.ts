import apiClient from "./client";
import type {
  CreateGoalRequest,
  Goal,
  GoalListParams,
  PaginationMeta,
  UpdateGoalRequest,
} from "./types";

export async function createGoal(data: CreateGoalRequest): Promise<Goal> {
  const res = await apiClient.post<{ goal: Goal }>("/goals", data);
  return res.data.goal;
}

export async function listGoals(
  params?: GoalListParams,
): Promise<{ goals: Goal[] | null; meta: PaginationMeta }> {
  const res = await apiClient.get<{ goals: Goal[] | null; meta: PaginationMeta }>(
    "/goals",
    { params },
  );
  return res.data;
}

export async function listGoalHistory(
  params?: Pick<GoalListParams, "page" | "per_page">,
): Promise<{ goals: Goal[] | null; meta: PaginationMeta }> {
  const res = await apiClient.get<{ goals: Goal[] | null; meta: PaginationMeta }>(
    "/goals/history",
    { params },
  );
  return res.data;
}

export async function getGoal(id: string): Promise<Goal> {
  const res = await apiClient.get<{ goal: Goal }>(`/goals/${id}`);
  return res.data.goal;
}

export async function updateGoal(
  id: string,
  data: UpdateGoalRequest,
): Promise<Goal> {
  const res = await apiClient.patch<{ goal: Goal }>(`/goals/${id}`, data);
  return res.data.goal;
}

export async function updateGoalProgress(
  id: string,
  amount: number,
): Promise<Goal> {
  const res = await apiClient.post<{ goal: Goal }>(`/goals/${id}/progress`, {
    amount,
  });
  return res.data.goal;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goals/${id}`);
}
