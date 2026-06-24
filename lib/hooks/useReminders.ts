import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReminder,
  deleteReminder,
  getReminder,
  listReminders,
  pauseReminder,
  resumeReminder,
  updateReminder,
} from "@/lib/api/reminders";
import type { CreateReminderRequest, ReminderListParams, UpdateReminderRequest } from "@/lib/api/types";

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useReminders(params?: ReminderListParams) {
  return useQuery({
    queryKey: ["reminders", params ?? {}],
    queryFn: () => listReminders(params),
    staleTime: 30_000,
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: ["reminders", id],
    queryFn: () => getReminder(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReminderRequest) => createReminder(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderRequest }) =>
      updateReminder(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      qc.invalidateQueries({ queryKey: ["reminders", id] });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function usePauseReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pauseReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useResumeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}

export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/lib/api/reminders").then((m) => m.completeReminderOccurrence(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
}
