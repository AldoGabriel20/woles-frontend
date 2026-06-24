import apiClient from "./client";
import type {
  CreateDocumentRequest,
  Document,
  DocumentListParams,
  StorageUsage,
  UpdateDocumentRequest,
  VaultHealth,
} from "./types";

export async function createDocument(
  data: CreateDocumentRequest,
): Promise<Document> {
  const res = await apiClient.post<{ document: Document }>("/documents", data);
  return res.data.document;
}

export async function listDocuments(
  params?: DocumentListParams,
): Promise<{ documents: Document[] }> {
  const res = await apiClient.get<{ documents: Document[] }>("/documents", {
    params,
  });
  return res.data;
}

export async function getDocument(id: string): Promise<Document> {
  const res = await apiClient.get<{ document: Document }>(`/documents/${id}`);
  return res.data.document;
}

export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest,
): Promise<Document> {
  const res = await apiClient.patch<{ document: Document }>(
    `/documents/${id}`,
    data,
  );
  return res.data.document;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}

/**
 * Upload a file attachment to a document.
 * Accepts PDF, JPEG, PNG — max 10 MB (enforced by backend).
 */
export async function uploadFile(documentId: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ document: Document }>(
    `/documents/${documentId}/file`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data.document;
}

export async function deleteDocumentFile(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}/file`);
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const res = await apiClient.get<{ storage: StorageUsage }>(
    "/documents/storage/usage",
  );
  return res.data.storage;
}

export async function getVaultHealth(): Promise<VaultHealth> {
  const res = await apiClient.get<{ health: VaultHealth }>(
    "/documents/vault/health",
  );
  return res.data.health;
}
