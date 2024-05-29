import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { ollama } from "ollama-ai-provider";

export function getModel() {
  if (process.env.PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return openai(process.env.MODEL || "gpt-4o");
  } else if (
    process.env.PROVIDER === "google" &&
    process.env.GOOGLE_GENERATIVE_API_KEY
  ) {
    return google(process.env.MODEL || "models/gemini-1.5-pro-latest");
  } else if (
    process.env.PROVIDER === "anthropic" &&
    process.env.ANTHROPIC_API_KEY
  ) {
    return anthropic(process.env.MODEL || "claude-3-haiku-20240307");
  } else if (process.env.PROVIDER === "groq" && process.env.GROQ_API_KEY) {
    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });
    return groq(process.env.MODEL || "llama3-8b-8192");
  } else if (process.env.PROVIDER === "ollama") {
    return ollama(process.env.MODEL || "phi3:3.8b-mini-instruct-4k-q4_K_M");
  } else {
    throw new Error("No API key provided for any of the supported models");
  }
}
