import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "@/lib/api/timeline";
import type { TimelineParams } from "@/lib/api/types";

export function useTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: ["timeline", params ?? {}],
    queryFn: () => getTimeline(params),
    staleTime: 30_000,
  });
}
