import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocument,
  deleteDocument,
  deleteDocumentFile,
  getDocument,
  getStorageUsage,
  getVaultHealth,
  listDocuments,
  updateDocument,
  uploadFile,
} from "@/lib/api/documents";
import type { CreateDocumentRequest, DocumentListParams, UpdateDocumentRequest } from "@/lib/api/types";

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useDocuments(params?: DocumentListParams) {
  return useQuery({
    queryKey: ["documents", params ?? {}],
    queryFn: () => listDocuments(params),
    staleTime: 30_000,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => getDocument(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: ["documents", "storage"],
    queryFn: getStorageUsage,
    staleTime: 60_000,
  });
}

export function useVaultHealth() {
  return useQuery({
    queryKey: ["documents", "vault-health"],
    queryFn: getVaultHealth,
    staleTime: 60_000,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => createDocument(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      updateDocument(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["documents", id] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useUploadDocumentFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadFile(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["documents", "storage"] });
    },
  });
}

export function useDeleteDocumentFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocumentFile(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["documents", "storage"] });
    },
  });
}
