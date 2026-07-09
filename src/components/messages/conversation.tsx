"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, markAsRead } from "@/actions/messages";

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
};

type Props = {
  partnerId: string;
  currentUserId: string;
  initialMessages: Message[];
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function Conversation({ partnerId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${partnerId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    } catch {
      // silencieux
    }
  }, [partnerId]);

  useEffect(() => {
    markAsRead(partnerId);
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [partnerId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      content: trimmed,
      createdAt: new Date(),
      senderId: currentUserId,
    };

    setMessages((prev) => [...prev, optimistic]);
    setContent("");
    setIsSending(true);

    const result = await sendMessage(partnerId, trimmed);
    if (result.success) {
      await fetchMessages();
    }
    setIsSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Fil de messages */}
      <div className="flex-1 overflow-y-auto px-[14px] py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-8">
            Commencez la conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-[14px] py-[10px] rounded-[16px] ${
                  isMe
                    ? "bg-[#1e1e1e] text-[#e8e8e8] rounded-br-[4px]"
                    : "bg-[#f7f7f7] text-[#1e1e1e] rounded-bl-[4px]"
                }`}
              >
                <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-[#e8e8e8]/60" : "text-muted-foreground"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="px-[14px] py-3 border-t border-[#e8e8e8] flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          className="flex-1 resize-none rounded-[12px] border border-[#e8e8e8] bg-[#f7f7f7] px-[14px] py-[10px] text-[14px] outline-none focus:border-[#1e1e1e] placeholder:text-muted-foreground max-h-[120px] overflow-y-auto"
          style={{ lineHeight: "1.4" }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="flex items-center justify-center size-[42px] rounded-full bg-[#1e1e1e] text-[#e8e8e8] shrink-0 disabled:opacity-40 transition-opacity"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
