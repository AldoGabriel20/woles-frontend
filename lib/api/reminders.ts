import apiClient from "./client";
import type {
  CreateReminderRequest,
  PaginationMeta,
  Reminder,
  ReminderListParams,
  UpdateReminderRequest,
} from "./types";

export async function createReminder(data: CreateReminderRequest): Promise<Reminder> {
  const res = await apiClient.post<{ reminder: Reminder }>("/reminders", data);
  return res.data.reminder;
}

export async function listReminders(
  params?: ReminderListParams,
): Promise<{ reminders: Reminder[]; meta: PaginationMeta }> {
  const res = await apiClient.get<{
    reminders: Reminder[];
    meta: PaginationMeta;
  }>("/reminders", { params });
  return res.data;
}

export async function getReminder(id: string): Promise<Reminder> {
  const res = await apiClient.get<{ reminder: Reminder }>(`/reminders/${id}`);
  return res.data.reminder;
}

export async function updateReminder(
  id: string,
  data: UpdateReminderRequest,
): Promise<Reminder> {
  const res = await apiClient.patch<{ reminder: Reminder }>(
    `/reminders/${id}`,
    data,
  );
  return res.data.reminder;
}

export async function deleteReminder(id: string): Promise<void> {
  await apiClient.delete(`/reminders/${id}`);
}

export async function pauseReminder(id: string): Promise<void> {
  await apiClient.post(`/reminders/${id}/pause`, {});
}

export async function resumeReminder(id: string): Promise<void> {
  await apiClient.post(`/reminders/${id}/resume`, {});
}

export async function completeReminderOccurrence(id: string): Promise<void> {
  await apiClient.post(`/reminders/${id}/complete`, {});
}
