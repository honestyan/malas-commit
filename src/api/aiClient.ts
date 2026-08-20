import { generateCompletionWithGroq } from "./groqClient";
import { generateCompletionWithGemini } from "./geminiClient";
import { config } from "../config";

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
  model?: string
): Promise<string> => {
  // Try Groq first if API key is available
  if (config.GROQ_APIKEY) {
    try {
      console.log("Attempting to generate completion with Groq...");
      const result = await generateCompletionWithGroq(messages, model);
      console.log("✓ Successfully generated with Groq");
      return result;
    } catch (error) {
      const groqErrMsg = error instanceof Error ? error.message : String(error);
      console.error(`Groq API Error: ${groqErrMsg}`);
      
      // Fall back to Gemini if available
      if (config.GEMINI_APIKEY) {
        console.warn("⚠ Groq API failed, trying Gemini fallback...");
        try {
          const result = await generateCompletionWithGemini(messages);
          console.log("✓ Successfully generated with Gemini");
          return result;
        } catch (geminiError) {
          const geminiErrMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
          console.error(`Gemini API Error: ${geminiErrMsg}`);
          throw new Error(
            `Both Groq and Gemini APIs failed.\n• Groq: ${groqErrMsg}\n• Gemini: ${geminiErrMsg}`
          );
        }
      } else {
        throw new Error(
          `${groqErrMsg}\n(Tip: You can configure a fallback with 'malas setConfig GEMINI_APIKEY <key>')`
        );
      }
    }
  }

  // If no Groq key, try Gemini directly
  if (config.GEMINI_APIKEY) {
    try {
      console.log("No Groq API key found, using Gemini...");
      const result = await generateCompletionWithGemini(messages, model);
      console.log("✓ Successfully generated with Gemini");
      return result;
    } catch (error) {
      const geminiErrMsg = error instanceof Error ? error.message : String(error);
      console.error(`Gemini API Error: ${geminiErrMsg}`);
      throw new Error(`Gemini API failed: ${geminiErrMsg}`);
    }
  }

  // No API keys configured
  throw new Error(
    "No API keys configured. Please set GROQ_APIKEY ('malas setConfig GROQ_APIKEY <your_key>') or GEMINI_APIKEY ('malas setConfig GEMINI_APIKEY <your_key>')"
  );
};

