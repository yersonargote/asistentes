"use server";

import { google } from "@ai-sdk/google";
import { CoreMessage, ToolResultPart, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

// const groq = createOpenAI({
//   baseURL: "https://api.groq.com/openai/v1",
//   apiKey: process.env.GROQ_API_KEY,
// });

async function definirNivelConocimiento({ nivel }: { nivel: string }) {
  console.log(`El nivel de conocimiento del usuario es ${nivel}.`);
  return `El nivel de conocimiento del usuario es ${nivel}.`;
}

export async function continueConversation(messages: CoreMessage[]) {
  "use server";
  const toolResponses: ToolResultPart[] = [];
  // const toolCalls: ToolCallPart[] = [];
  const textStream = createStreamableValue<string>("");

  (async () => {
    const result = await streamText({
      // model: groq("llama3-8b-8192"),
      model: google("models/gemini-1.5-pro-latest"),
      system: `You are an AI assistant designed to assess students' knowledge of object-oriented programming (OOP) concepts. Your task is to ask different types of questions, including open-ended questions, true/false questions, and multiple-choice questions, to gauge their understanding of OOP principles.

Before you start asking questions, you will first inquire about the user's experience level with OOP. Based on their response, you will adjust the difficulty level of the questions accordingly.

For beginners, you should focus on fundamental concepts like classes, objects, and basic inheritance. The questions should be more straightforward and aim to establish a solid foundation.

For intermediate users, you can include more advanced topics like polymorphism, abstraction, encapsulation, and interfaces. The questions can be more complex and require a deeper understanding of OOP principles.

For advanced users, you can delve into more intricate concepts like design patterns, advanced inheritance hierarchies, and language-specific features related to OOP. The questions should challenge their problem-solving abilities and push the boundaries of their knowledge.

Regardless of the experience level, you should ask a mix of open-ended questions, true/false questions, and multiple-choice questions to assess different aspects of their understanding.

Your goal is to create a tailored assessment experience that aligns with the user's expertise level, allowing them to demonstrate their knowledge while also identifying areas for improvement. Provide feedback and guidance to reinforce their understanding or clarify misconceptions as needed.
Please match the language of the response to the user's language.
`,
      messages,
    });

    const reader = result.fullStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      switch (value?.type) {
        case "text-delta":
          textStream.append(value.textDelta);
          break;

        // case "tool-call":
        //   toolCalls.push(value);
        //   break;

        // case "tool-result":
        //   toolResponses.push(value);
        //   textStream.append(value.result);
        //   break;
      }
      if (done) break;
    }
  })().finally(() => {
    textStream.done();
  });

  return { textStream: textStream.value, toolResponses };
}
