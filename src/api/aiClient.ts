import { generateCompletionWithGroq } from "./groqClient.js";
import { generateCompletionWithGemini } from "./geminiClient.js";
import { config } from "../config.js";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Unified AI completion function with fallback logic
 * Tries Groq first, then falls back to Gemini if Groq fails
 */
export const generateCompletion = async (
  messages: Message[],
  model = "llama-3.1-8b-instant"
): Promise<string> => {
  // Try Groq first if API key is available
  if (config.GROQ_APIKEY) {
    try {
      console.log("Attempting to generate completion with Groq...");
      const result = await generateCompletionWithGroq(messages, model);
      console.log("✓ Successfully generated with Groq");
      return result;
    } catch (error) {
      console.warn("⚠ Groq API failed, trying Gemini fallback...");
      
      // Fall back to Gemini if available
      if (config.GEMINI_APIKEY) {
        try {
          const result = await generateCompletionWithGemini(messages);
          console.log("✓ Successfully generated with Gemini");
          return result;
        } catch (geminiError) {
          throw new Error(
            `Both Groq and Gemini APIs failed. Groq: ${error}, Gemini: ${geminiError}`
          );
        }
      } else {
        throw new Error(
          `Groq API failed and no Gemini API key configured. Error: ${error}`
        );
      }
    }
  }

  // If no Groq key, try Gemini directly
  if (config.GEMINI_APIKEY) {
    try {
      console.log("No Groq API key found, using Gemini...");
      const result = await generateCompletionWithGemini(messages);
      console.log("✓ Successfully generated with Gemini");
      return result;
    } catch (error) {
      throw new Error(`Gemini API failed: ${error}`);
    }
  }

  // No API keys configured
  throw new Error(
    "No API keys configured. Please set either GROQ_APIKEY or GEMINI_APIKEY"
  );
};
