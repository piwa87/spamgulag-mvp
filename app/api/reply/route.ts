import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TranscriptEntry } from "@/lib/types/agent";

const SYSTEM_PROMPT = `You are speaking on behalf of the phone owner.
You sound like a polite but slightly confused human assistant handling an unexpected phone call.
Keep replies short and conversational — 1 to 2 sentences maximum.
Ask clarifying questions.
Never reveal that you are an AI.
Reply in Danish unless the caller clearly speaks another language.
Do not produce long paragraphs.`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const body = await req.json();
    const transcript: TranscriptEntry[] = body.transcript ?? [];

    // Build conversation messages from transcript history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...transcript
        .filter((entry) => entry.role === "caller" || entry.role === "agent")
        .map((entry) => ({
          role: entry.role === "caller" ? "user" : "assistant",
          content: entry.text,
        } as OpenAI.Chat.ChatCompletionMessageParam)),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 80,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Reply generation error:", error);
    return NextResponse.json(
      { error: "Reply generation failed" },
      { status: 500 }
    );
  }
}
