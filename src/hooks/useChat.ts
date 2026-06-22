"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/trip";

interface UseChatOptions {
  tripId: string;
  currentDayIndex: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isStreaming: boolean;
  error: string | null;
  dailyCount: number;
  sendMessage: (text: string) => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => Promise<void>;
}

export function useChat({ tripId, currentDayIndex }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Load history from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [historyRes, countRes] = await Promise.all([
        supabase
          .from("trip_chats")
          .select("id, role, content, created_at")
          .eq("trip_id", tripId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(20),
        supabase
          .from("trip_chats")
          .select("*", { count: "exact", head: true })
          .eq("trip_id", tripId)
          .eq("user_id", user.id)
          .eq("role", "user")
          .gte("created_at", today.toISOString()),
      ]);

      if (cancelled) return;

      if (historyRes.data) {
        setMessages(
          historyRes.data.map((m) => ({
            id: m.id as string,
            role: m.role as "user" | "assistant",
            content: m.content as string,
            timestamp: new Date(m.created_at as string),
          }))
        );
      }
      setDailyCount(countRes.count ?? 0);
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [tripId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      // Snapshot history BEFORE adding new messages
      const historySnapshot = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setDailyCount((c) => c + 1);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/trips/${tripId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: historySnapshot,
            currentDay: currentDayIndex,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(
            (json as { error?: string }).error ?? `Error ${res.status}`
          );
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: fullContent };
            }
            return updated;
          });
        }

        // Mark done
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, isStreaming: false };
          }
          return updated;
        });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          // User stopped — just mark done
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.isStreaming) {
              updated[updated.length - 1] = { ...last, isStreaming: false };
            }
            return updated;
          });
          return;
        }
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
        // Remove the empty assistant placeholder
        setMessages((prev) =>
          prev.filter((_, i) => i !== prev.length - 1 || prev[i].content !== "")
        );
        setDailyCount((c) => Math.max(0, c - 1));
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, tripId, currentDayIndex]
  );

  function stopStreaming() {
    abortRef.current?.abort();
  }

  async function clearMessages() {
    setMessages([]);
    await fetch(`/api/trips/${tripId}/chat`, { method: "DELETE" });
    setDailyCount(0);
  }

  return {
    messages,
    setMessages,
    isStreaming,
    error,
    dailyCount,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
