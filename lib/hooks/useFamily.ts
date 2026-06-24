import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFamilyMember,
  deleteFamilyMember,
  getFamilyMember,
  getSharedReminders,
  listFamilyMembers,
  updateFamilyMember,
} from "@/lib/api/family";
import type { CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from "@/lib/api/types";

export function useFamilyMembers() {
  return useQuery({
    queryKey: ["family", "members"],
    queryFn: listFamilyMembers,
    staleTime: 30_000,
  });
}

export function useFamilyMember(id: string) {
  return useQuery({
    queryKey: ["family", "members", id],
    queryFn: () => getFamilyMember(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useSharedReminders(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["family", "reminders", params ?? {}],
    queryFn: () => getSharedReminders(params),
    staleTime: 30_000,
  });
}

export function useCreateFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFamilyMemberRequest) => createFamilyMember(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });
}

export function useUpdateFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFamilyMemberRequest }) =>
      updateFamilyMember(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });
}

export function useDeleteFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFamilyMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });
}
