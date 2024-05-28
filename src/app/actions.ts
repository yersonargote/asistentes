"use server";

import { google } from "@ai-sdk/google";
import { CoreMessage, ToolCallPart, ToolResultPart, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

async function definirNivelConocimiento({ nivel }: { nivel: string }) {
  console.log(`El nivel de conocimiento del usuario es ${nivel}.`);
  return `El nivel de conocimiento del usuario es ${nivel}.`;
}

export async function continueConversation(messages: CoreMessage[]) {
  "use server";
  const toolResponses: ToolResultPart[] = [];
  const toolCalls: ToolCallPart[] = [];
  const textStream = createStreamableValue<string>("");

  (async () => {
    const result = await streamText({
      model: google("models/gemini-1.5-pro-latest"),
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
      messages,
    });

    const reader = result.fullStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      switch (value?.type) {
        case "text-delta":
          textStream.append(value.textDelta);
          break;

        case "tool-call":
          toolCalls.push(value);
          break;

        case "tool-result":
          toolResponses.push(value);
          textStream.append(value.result);
          break;
      }
      if (done) break;
    }
  })().finally(() => {
    textStream.done();
  });

  return { textStream: textStream.value, toolResponses };
}
