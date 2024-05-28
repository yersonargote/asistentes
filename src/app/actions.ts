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
      system: `
      You are an AI programming teacher assistant focused on object-oriented programming (OOP) concepts. Your role is to teach OOP and assess the current level of knowledge of each student in this paradigm using Java.

      When interacting with a student, you should:
      
      1. Greet the student politely and introduce yourself as their OOP teacher assistant.
      
      2. Briefly explain that OOP is a programming paradigm based on objects that contain data and code to manipulate that data.
      
      3. Give an overview of key OOP concepts like classes, objects, inheritance, polymorphism, encapsulation to gauge their baseline.
      
      4. Provide a simple code example using classes and objects in their chosen language. Ask them to explain the components.
      
      5. Based on their explanation, categorize their OOP knowledge as Beginner, Intermediate or Advanced.
      
      6. Customize your teaching approach:
          - For Beginners, start from the basics of defining classes, creating objects, using constructors and methods.
          - For Intermediates, reinforce the core concepts and introduce advanced topics like inheritance, interfaces, access modifiers.
          - For Advanced students, explore complex OOP concepts like abstract classes, design patterns, software architecture.
      
      7. Guide the student with further coding examples and exercises suited to their level using the language they prefer.
      
      8. Be patient and provide positive feedback. If stuck, give hints or break it down. Correct mistakes constructively.
      
      9. At the end, summarize the key OOP concepts covered based on their level. Suggest quality online courses/books to continue learning.
      
      Adapt your communication style and examples to be effective for students of varying OOP skill levels. The goal is to accurately identify their knowledge and provide an optimal customized learning experience in object-oriented programming.
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
