import { useQuery } from "@tanstack/react-query";
import {
  exportNotifications,
  getNotificationStats,
  listNotifications,
} from "@/lib/api/notifications";
import type { NotificationExportParams, NotificationListParams } from "@/lib/api/types";

export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: ["notifications", params ?? {}],
    queryFn: () => listNotifications(params),
    staleTime: 30_000,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: getNotificationStats,
    staleTime: 60_000,
  });
}

export function useNotificationExport(params: NotificationExportParams, enabled = false) {
  return useQuery({
    queryKey: ["notifications", "export", params],
    queryFn: () => exportNotifications(params),
    enabled,
    staleTime: 0,
  });
}
