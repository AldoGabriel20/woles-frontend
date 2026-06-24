import apiClient from "./client";
import type { TimelineItem, TimelineParams } from "./types";

export async function getTimeline(
  params?: TimelineParams,
): Promise<TimelineItem[]> {
  const res = await apiClient.get<{ items: TimelineItem[] }>("/timeline", {
    params,
  });
  return res.data.items ?? [];
}
