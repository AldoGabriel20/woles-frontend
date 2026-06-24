import apiClient from "./client";
import type {
  CreateFamilyMemberRequest,
  FamilyMember,
  PaginationMeta,
  Reminder,
  UpdateFamilyMemberRequest,
} from "./types";

export async function createFamilyMember(
  data: CreateFamilyMemberRequest,
): Promise<FamilyMember> {
  const res = await apiClient.post<{ member: FamilyMember }>(
    "/family/members",
    data,
  );
  return res.data.member;
}

export async function listFamilyMembers(): Promise<FamilyMember[]> {
  const res = await apiClient.get<{ members: FamilyMember[] }>(
    "/family/members",
  );
  return res.data.members ?? [];
}

export async function getFamilyMember(id: string): Promise<FamilyMember> {
  const res = await apiClient.get<{ member: FamilyMember }>(
    `/family/members/${id}`,
  );
  return res.data.member;
}

export async function updateFamilyMember(
  id: string,
  data: UpdateFamilyMemberRequest,
): Promise<FamilyMember> {
  const res = await apiClient.patch<{ member: FamilyMember }>(
    `/family/members/${id}`,
    data,
  );
  return res.data.member;
}

export async function deleteFamilyMember(id: string): Promise<void> {
  await apiClient.delete(`/family/members/${id}`);
}

export async function getSharedReminders(params?: {
  page?: number;
  per_page?: number;
}): Promise<{ reminders: Reminder[]; meta: PaginationMeta }> {
  const res = await apiClient.get<{
    reminders: Reminder[];
    meta: PaginationMeta;
  }>("/family/reminders", { params });
  return res.data;
}
