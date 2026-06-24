import apiClient from "./client";
import type {
  Notification,
  NotificationExportParams,
  NotificationListParams,
  NotificationStats,
  PaginationMeta,
} from "./types";

export async function listNotifications(
  params?: NotificationListParams,
): Promise<{ notifications: Notification[]; meta: PaginationMeta }> {
  const res = await apiClient.get<{
    notifications: Notification[];
    meta: PaginationMeta;
  }>("/notifications", { params });
  return res.data;
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const res = await apiClient.get<{ stats: NotificationStats }>(
    "/notifications/stats",
  );
  return res.data.stats;
}

/**
 * Export notification history as CSV or PDF.
 * Returns the raw string content (CSV rows or plain-text PDF).
 */
export async function exportNotifications(
  params: NotificationExportParams,
): Promise<string> {
  const res = await apiClient.get<{ raw: string }>("/notifications/export", {
    params,
  });
  return res.data.raw;
}
