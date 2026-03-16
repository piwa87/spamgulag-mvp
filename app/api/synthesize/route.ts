import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const body = await req.json();
    const text: string = body.text ?? "";

    if (!text.trim()) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3",
    });

    const audioBuffer = await mp3Response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Synthesis error:", error);
    return NextResponse.json(
      { error: "Speech synthesis failed" },
      { status: 500 }
    );
  }
}
