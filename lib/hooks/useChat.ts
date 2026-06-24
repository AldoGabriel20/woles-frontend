import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAllMessages,
  getChatUsage,
  getDetectedIntents,
  listMessages,
  sendMessage,
} from "@/lib/api/chat";

export function useChatMessages(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ["chat", "messages", params ?? {}],
    queryFn: () => listMessages(params),
    staleTime: 30_000,
  });
}

export function useChatUsage() {
  return useQuery({
    queryKey: ["chat", "usage"],
    queryFn: getChatUsage,
    staleTime: 30_000,
  });
}

export function useChatIntents() {
  return useQuery({
    queryKey: ["chat", "intents"],
    queryFn: getDetectedIntents,
    staleTime: 60_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "messages"] });
      qc.invalidateQueries({ queryKey: ["chat", "usage"] });
      qc.invalidateQueries({ queryKey: ["chat", "intents"] });
    },
  });
}

export function useDeleteAllMessages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAllMessages,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat"] }),
  });
}
