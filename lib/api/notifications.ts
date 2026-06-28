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
 * Export notification history as CSV, PDF, or Excel.
 * Returns a Blob ready for download.
 */
export async function exportNotifications(
  params: NotificationExportParams,
): Promise<Blob> {
  const res = await apiClient.get<ArrayBuffer>("/notifications/export", {
    params,
    responseType: "arraybuffer",
  });
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  };
  return new Blob([res.data], { type: mimeMap[params.format] ?? "text/csv" });
}
