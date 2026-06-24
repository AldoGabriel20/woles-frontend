"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { listMessages } from "@/lib/api/chat";
import { MessageListPanel } from "@/components/chat/message-list-panel";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  // Mobile: toggle between panel view and chat view
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat", "messages"],
    queryFn: () => listMessages({ per_page: 200 }),
    staleTime: 30_000,
  });

  const messages = messagesData?.messages ?? [];

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col overflow-hidden bg-surface lg:h-[calc(100dvh-3rem)]">
      {/* ─── Mobile header ── */}
      <div className="flex items-center border-b border-outline-variant bg-surface px-4 py-3 lg:hidden">
        {mobileView === "chat" ? (
          <button
            onClick={() => setMobileView("list")}
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            aria-label="View conversations"
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <h1 className="font-display text-title-lg text-on-surface">
          {mobileView === "list" ? "Conversations" : "AI Chat"}
        </h1>
        {mobileView === "list" && (
          <button
            onClick={() => setMobileView("chat")}
            className="ml-auto text-label-md text-primary"
          >
            New Chat →
          </button>
        )}
      </div>

      {/* ─── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — desktop always visible; mobile visible only in list view */}
        <div
          className={[
            "w-full flex-col lg:flex lg:w-72 lg:shrink-0",
            mobileView === "list" ? "flex" : "hidden",
          ].join(" ")}
        >
          <MessageListPanel
            onSelectDay={() => setMobileView("chat")}
          />
        </div>

        {/* Right chat area — desktop always visible; mobile visible only in chat view */}
        <div
          className={[
            "w-full flex-1 flex-col lg:flex",
            mobileView === "chat" ? "flex" : "hidden",
          ].join(" ")}
        >
          <ChatArea initialMessages={messages} isLoading={messagesLoading} />
        </div>
      </div>
    </div>
  );
}
