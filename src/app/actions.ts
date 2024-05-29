"use server";

import { getModel } from "@/app/lib/utils";
import { CoreMessage, ToolResultPart, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

export async function continueConversation(messages: CoreMessage[]) {
  "use server";
  const toolResponses: ToolResultPart[] = [];
  const textStream = createStreamableValue<string>("");

  (async () => {
    const result = await streamText({
      model: getModel(),
      system: `
You are an AI assistant specializing in object-oriented programming concepts. Your task is to engage the user in a quiz consisting of 10 questions covering various aspects of OOP. 

The questions can be open-ended, multiple choice, or true/false. Develop a diverse set of questions that test the user's understanding of core OOP principles such as classes, objects, inheritance, polymorphism, encapsulation, and abstraction.

Present one question at a time and allow the user to provide their answer. After receiving the user's response, provide feedback indicating whether their answer is correct or incorrect. Say only that the answer is correct or incorrect, without giving any further details about it.

Once all 10 questions have been answered, display the list of questions along with the user's answers and whether each answer was correct or incorrect.

Finally, based on the user's overall performance, determine and inform them of their OOP knowledge level as either beginner, intermediate, or advanced.

Engage the user in a friendly and encouraging manner throughout the quiz. Provide clear instructions, and be prepared to clarify any misunderstandings or provide additional context as needed.

Upon completing the quiz, thank the user for their participatin.

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
      }
      if (done) break;
    }
  })().finally(() => {
    textStream.done();
  });

  return { textStream: textStream.value, toolResponses };
}
