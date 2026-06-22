import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { getTripWithDays, saveChatMessage, getDailyMessageCount } from "@/lib/db/trips";
import { buildChatSystemPrompt } from "@/lib/prompts/chat-context";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const MAX_DAILY = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      message,
      history = [],
      currentDay,
      silent = false,
    }: {
      message: string;
      history: { role: string; content: string }[];
      currentDay?: number;
      silent?: boolean;
    } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Rate limit (skip for silent conflict checks)
    if (!silent) {
      const count = await getDailyMessageCount(id, user.id);
      if (count >= MAX_DAILY) {
        return NextResponse.json(
          { error: `You've reached today's limit of ${MAX_DAILY} messages. Resets at midnight.` },
          { status: 429 }
        );
      }
    }

    const trip = await getTripWithDays(id, user.id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const systemPrompt = buildChatSystemPrompt(trip, currentDay);

    // Trim to last 10 messages to control token cost
    const trimmedHistory = history.slice(-10);

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Save user message before streaming (skip for silent)
    if (!silent) {
      await saveChatMessage(id, user.id, "user", message);
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          if (!silent && fullResponse) {
            await saveChatMessage(id, user.id, "assistant", fullResponse);
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("trip_chats")
    .delete()
    .eq("trip_id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
