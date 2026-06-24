"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import type { AxiosError } from "axios";

import { getChatUsage, getDetectedIntents, sendMessage } from "@/lib/api/chat";
import type { ApiError, ChatMessage, DetectedIntent } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/useAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={["flex mb-3", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[75%] px-4 py-2.5 text-body-md",
          isUser
            ? "rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-primary text-on-primary"
            : "rounded-tl-xl rounded-tr-xl rounded-br-xl border border-outline-variant bg-surface-container-lowest text-on-surface",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p
          className={[
            "mt-1 text-right text-label-sm",
            isUser ? "text-on-primary/60" : "text-on-surface-variant",
          ].join(" ")}
        >
          {formatTime(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Quota banner ─────────────────────────────────────────────────────────────

function QuotaBanner({
  usage,
  onDismiss,
}: {
  usage: { messages_used: number; quota: number; remaining: number };
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2">
      <p className="text-label-md text-amber-800">
        Free Plan · {usage.remaining} message{usage.remaining !== 1 ? "s" : ""} remaining this month.{" "}
        <Link href="/billing/checkout" className="font-medium underline">
          Go Unlimited →
        </Link>
      </p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-amber-600 hover:text-amber-800"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Chat Area ────────────────────────────────────────────────────────────────

interface ChatAreaProps {
  initialMessages?: ChatMessage[];
  isLoading?: boolean;
}

export function ChatArea({ initialMessages = [], isLoading = false }: ChatAreaProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const plan = user?.plan ?? "free";

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [showIntentPopover, setShowIntentPopover] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(content),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.user_message, data.assistant_message]);
      setQuotaError(false);
      queryClient.invalidateQueries({ queryKey: ["chat", "usage"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
    },
    onError: (err) => {
      const axErr = err as AxiosError<ApiError>;
      if (axErr.response?.status === 403) {
        setQuotaError(true);
      }
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  // Sync initial messages
  useEffect(() => {
    if (initialMessages.length > 0) setMessages(initialMessages);
  }, [initialMessages]);

  function handleSend() {
    const content = input.trim();
    if (!content || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(content);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showBanner =
    plan === "free" && usage && usage.remaining < usage.quota && !bannerDismissed;

  return (
    <div className="flex h-full flex-col">
      {/* Quota banner */}
      {showBanner && usage && (
        <QuotaBanner usage={usage} onDismiss={() => setBannerDismissed(true)} />
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[0.6, 0.4, 0.7, 0.5].map((w, i) => (
              <div key={i} className={["flex", i % 2 === 0 ? "justify-start" : "justify-end"].join(" ")}>
                <div
                  className="animate-pulse rounded-2xl bg-surface-container"
                  style={{ width: `${w * 100}%`, height: 44 }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 && !sendMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-5xl">💬</span>
            <p className="mb-1 font-display text-title-lg text-on-surface">
              Start a conversation
            </p>
            <p className="max-w-sm text-body-md text-on-surface-variant">
              Type anything — tell Woles what you want to track, and it will create
              reminders automatically.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                "Ingatkan bayar internet tiap tanggal 10",
                "Servis mobil 6 bulan sekali",
                "STNK mau habis bulan depan",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-label-sm text-on-surface hover:bg-surface-container"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading indicator */}
        {sendMutation.isPending && (
          <div className="mb-3 flex justify-start">
            <div className="rounded-tl-xl rounded-tr-xl rounded-br-xl border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-2 animate-bounce rounded-full bg-on-surface-variant"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quota exceeded error */}
        {quotaError && (
          <div className="mx-auto my-4 max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="mb-2 font-display text-label-lg text-amber-800">
              Monthly quota reached
            </p>
            <p className="mb-3 text-label-md text-amber-700">
              You&apos;ve used all your free messages for this month.
            </p>
            <Link
              href="/billing/checkout"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Intent suggestions popover */}
      {showIntentPopover && intents && intents.length > 0 && (
        <div className="border-t border-outline-variant bg-surface-container px-4 py-2">
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {intents.slice(0, 6).map((intent: DetectedIntent) => (
              <button
                key={intent.id}
                onClick={() => {
                  setInput(intent.intent_type.replace(/_/g, " "));
                  setShowIntentPopover(false);
                  inputRef.current?.focus();
                }}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-label-sm text-primary hover:bg-primary/20"
              >
                {intent.intent_type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-outline-variant bg-surface px-4 py-3">
        {/* Suggest intent button */}
        <button
          onClick={() => setShowIntentPopover((p) => !p)}
          className="mb-2 flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-primary"
        >
          <Sparkles size={14} />
          Suggest Intent
        </button>

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or describe what you want to track..."
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-outline-variant bg-surface-container px-3.5 py-2.5 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow transition hover:brightness-110 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
