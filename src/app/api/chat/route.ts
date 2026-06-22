import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// In-memory rate limit: 20 general messages per user per day
const dailyLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const entry = dailyLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    dailyLimits.set(userId, { count: 1, resetAt: midnight.getTime() });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are Roamly AI, a friendly expert travel assistant. Help users plan trips, discover destinations, pack smarter, and travel better.

BEHAVIOUR:
- Be warm, enthusiastic, and concise
- Give practical, actionable travel advice
- Suggest real destinations and real experiences
- Keep responses under 200 words unless a detailed breakdown is explicitly requested
- Use bullet points for lists, prose for conversational replies
- Use travel emojis occasionally to keep it friendly ✈️ 🗺️ 🍽️
- If someone is ready to plan a specific trip, encourage them to use Roamly's trip planner`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "You've reached today's limit of 20 messages. Resets at midnight." },
      { status: 429 }
    );
  }

  try {
    const {
      message,
      history = [],
    }: { message: string; history: { role: string; content: string }[] } =
      await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(new TextEncoder().encode(text));
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
    console.error("[general-chat]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
