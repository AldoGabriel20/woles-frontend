import apiClient from "./client";
import type {
  CreateSubscriptionRequest,
  PaginationMeta,
  Subscription,
  SubscriptionListParams,
  UpdateSubscriptionRequest,
} from "./types";

export async function createSubscription(
  data: CreateSubscriptionRequest,
): Promise<Subscription> {
  const res = await apiClient.post<{ subscription: Subscription }>(
    "/subscriptions",
    data,
  );
  return res.data.subscription;
}

export async function listSubscriptions(
  params?: SubscriptionListParams,
): Promise<{ subscriptions: Subscription[]; meta: PaginationMeta }> {
  const res = await apiClient.get<{
    subscriptions: Subscription[];
    meta: PaginationMeta;
  }>("/subscriptions", { params });
  return res.data;
}

export async function getSubscription(id: string): Promise<Subscription> {
  const res = await apiClient.get<{ subscription: Subscription }>(
    `/subscriptions/${id}`,
  );
  return res.data.subscription;
}

export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionRequest,
): Promise<Subscription> {
  const res = await apiClient.patch<{ subscription: Subscription }>(
    `/subscriptions/${id}`,
    data,
  );
  return res.data.subscription;
}

export async function archiveSubscription(id: string): Promise<void> {
  await apiClient.post(`/subscriptions/${id}/archive`, {});
}

export async function deleteSubscription(id: string): Promise<void> {
  await apiClient.delete(`/subscriptions/${id}`);
}
