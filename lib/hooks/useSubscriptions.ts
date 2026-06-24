import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveSubscription,
  createSubscription,
  deleteSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscription,
} from "@/lib/api/subscriptions";
import type { CreateSubscriptionRequest, SubscriptionListParams, UpdateSubscriptionRequest } from "@/lib/api/types";

export function useSubscriptions(params?: SubscriptionListParams) {
  return useQuery({
    queryKey: ["subscriptions", params ?? {}],
    queryFn: () => listSubscriptions(params),
    staleTime: 30_000,
  });
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => getSubscription(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => createSubscription(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionRequest }) =>
      updateSubscription(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      qc.invalidateQueries({ queryKey: ["subscriptions", id] });
    },
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

export function useArchiveSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveSubscription(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}
