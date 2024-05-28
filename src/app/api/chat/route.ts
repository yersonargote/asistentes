import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";

async function definirNivelConocimiento({ nivel }: { nivel: string }) {
  console.log(`El nivel de conocimiento del usuario es ${nivel}.`);
  return `El nivel de conocimiento del usuario es ${nivel}.`;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("models/gemini-1.5-pro-latest"),
    system: `Eres un asistente que hace preguntas al usuario e identifica que nivel de conocimiento tiene sobre programación orientada a objetos.`,
    messages,
    tools: {
      definirNivelConocimiento: {
        description:
          "Define el nivel de conocimiento del usuario sobre programación orientada a objetos.",
        parameters: z.object({
          nivel: z.enum(["básico", "intermedio", "avanzado"]),
        }),
        execute: definirNivelConocimiento,
      },
    },
  });

  return result.toAIStreamResponse();
}
