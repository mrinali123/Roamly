"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
}

function timeAgo(d?: Date): string {
  if (!d) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
  timestamp,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex items-end justify-end gap-2 group">
        <div className="max-w-[82%]">
          <div className="rounded-2xl rounded-tr-sm bg-navy px-4 py-2.5 text-sm text-white leading-relaxed border border-slate-700/50">
            {content}
          </div>
          <p className="mt-1 text-right text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {timeAgo(timestamp)}
          </p>
        </div>
        <div className="mb-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky text-xs font-bold text-navy">
          U
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-navy text-base">
        🧭
      </div>
      <div className="min-w-0 flex-1">
        {isStreaming && !content ? (
          <div className="flex items-center gap-1 py-2">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : (
          <div className="chat-prose text-sm text-slate-300 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {isStreaming && <span className="streaming-cursor">▊</span>}
          </div>
        )}
        {!isStreaming && (
          <p className="mt-1 text-xs text-slate-600">{timeAgo(timestamp)}</p>
        )}
      </div>
    </div>
  );
}
