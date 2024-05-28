import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    system:
      "Eres un asistente que hace preguntas al usuario e identifica que nivel de conocimiento tiene sobre programación orientada a objetos.",
    messages,
  });

  return result.toAIStreamResponse();
}
