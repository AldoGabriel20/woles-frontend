import apiClient from "./client";
import type { UpdateProfileRequest, User } from "./types";

export async function getProfile(): Promise<User> {
  const res = await apiClient.get<{ profile: User }>("/account/profile");
  return res.data.profile;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const res = await apiClient.patch<{ profile: User }>(
    "/account/profile",
    data,
  );
  return res.data.profile;
}

/**
 * Upload a profile avatar.
 * Accepts JPEG or PNG — max 2 MB (enforced by backend).
 */
export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await apiClient.post<{ avatar_url: string }>(
    "/account/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

/**
 * Export all account data as a JSON attachment.
 * Returns the raw Blob so the caller can trigger a browser download.
 */
export async function exportAccountData(): Promise<Blob> {
  const res = await apiClient.get("/account/export", {
    responseType: "blob",
  });
  return res.data as Blob;
}

/**
 * Soft-delete the authenticated account.
 * The backend revokes all sessions and writes an audit log entry.
 */
export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/account");
}
