import apiClient from "./client";
import type { ChatMessage, ChatUsage, DetectedIntent, PaginationMeta } from "./types";

export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export async function sendMessage(content: string): Promise<SendMessageResponse> {
  const res = await apiClient.post<{ result: SendMessageResponse }>(
    "/chat/messages",
    { content },
  );
  return res.data.result;
}

export async function listMessages(params?: {
  page?: number;
  per_page?: number;
}): Promise<{ messages: ChatMessage[]; meta?: PaginationMeta }> {
  const res = await apiClient.get<{
    messages: ChatMessage[];
    meta?: PaginationMeta;
  }>("/chat/messages", { params });
  return res.data;
}

export async function deleteAllMessages(): Promise<void> {
  await apiClient.delete("/chat/messages");
}

export async function getChatUsage(): Promise<ChatUsage> {
  const res = await apiClient.get<{ usage: ChatUsage }>("/chat/usage");
  return res.data.usage;
}

export async function getDetectedIntents(): Promise<DetectedIntent[]> {
  const res = await apiClient.get<{ intents: DetectedIntent[] }>(
    "/chat/intents",
  );
  return res.data.intents ?? [];
}
