"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import { getChatUsage, getDetectedIntents, deleteAllMessages, listMessages } from "@/lib/api/chat";
import type { ChatMessage, DetectedIntent } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDay(messages: ChatMessage[]): { day: string; preview: string }[] {
  const seen = new Set<string>();
  const groups: { day: string; preview: string }[] = [];
  for (const m of messages) {
    const day = formatDay(m.created_at);
    if (!seen.has(day)) {
      seen.add(day);
      groups.push({ day, preview: m.content.slice(0, 50) + (m.content.length > 50 ? "…" : "") });
    }
  }
  return groups;
}

function intentIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("goal") || t.includes("saving")) return "💰";
  if (t.includes("bill") || t.includes("payment")) return "📅";
  if (t.includes("vehicle") || t.includes("stnk") || t.includes("car")) return "🚗";
  if (t.includes("insurance")) return "🛡️";
  if (t.includes("subscription")) return "📺";
  return "🔔";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MessageListPanelProps {
  onSelectDay?: (day: string) => void;
}

export function MessageListPanel({ onSelectDay }: MessageListPanelProps) {
  const queryClient = useQueryClient();

  const { data: messagesData } = useQuery({
    queryKey: ["chat", "messages"],
    queryFn: () => listMessages({ per_page: 100 }),
    staleTime: 30_000,
  });

  const { data: usage } = useQuery({
    queryKey: ["chat", "usage"],
    queryFn: getChatUsage,
    staleTime: 30_000,
  });

  const { data: intents } = useQuery({
    queryKey: ["chat", "intents"],
    queryFn: getDetectedIntents,
    staleTime: 60_000,
  });

  const clearMutation = useMutation({
    mutationFn: deleteAllMessages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });

  const messages = messagesData?.messages ?? [];
  const dayGroups = groupByDay(messages);

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-outline-variant bg-surface-container-lowest">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3.5">
        <h2 className="font-display text-title-md text-on-surface">
          Conversations
        </h2>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all chat history?")) clearMutation.mutate();
            }}
            aria-label="Clear history"
            className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {dayGroups.length === 0 ? (
          <p className="px-4 py-6 text-label-md text-on-surface-variant">
            No conversations yet.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {dayGroups.map((g) => (
              <li key={g.day}>
                <button
                  onClick={() => onSelectDay?.(g.day)}
                  className="flex w-full flex-col px-4 py-3 text-left hover:bg-surface-container"
                >
                  <span className="mb-0.5 text-label-sm font-medium text-on-surface-variant">
                    {g.day}
                  </span>
                  <span className="line-clamp-1 text-label-md text-on-surface">
                    {g.preview}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Intents section */}
        {intents && intents.length > 0 && (
          <div className="border-t border-outline-variant px-4 py-3">
            <p className="mb-2 text-label-sm font-medium text-on-surface-variant">
              Detected Intents
            </p>
            <div className="flex flex-wrap gap-1.5">
              {intents.slice(0, 6).map((intent: DetectedIntent) => (
                <span
                  key={intent.id}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-label-sm text-primary"
                >
                  {intentIcon(intent.intent_type)} {intent.intent_type.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage footer */}
      {usage && (
        <div className="border-t border-outline-variant px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-label-sm">
            <span className="text-on-surface-variant">
              {usage.messages_used} of {usage.quota} messages used
            </span>
            <a href="/billing/checkout" className="text-primary hover:underline">
              Upgrade →
            </a>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, Math.round((usage.messages_used / usage.quota) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
