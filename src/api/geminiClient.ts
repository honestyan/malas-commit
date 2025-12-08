import axios from "axios";
import { config } from "../config.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
}

/**
 * Converts OpenAI-style messages to Gemini format
 */
const convertMessagesToGeminiFormat = (messages: Message[]) => {
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMessages.length > 0
    ? {
        parts: systemMessages.map((msg) => ({ text: msg.content })),
      }
    : undefined;

  const contents: GeminiContent[] = conversationMessages.map((msg) => ({
    parts: [{ text: msg.content }],
  }));

  return {
    system_instruction: systemInstruction,
    contents,
  };
};

export const generateCompletionWithGemini = async (
  messages: Message[]
): Promise<string> => {
  try {
    const geminiPayload = convertMessagesToGeminiFormat(messages);

    const response = await axios.post(
      `${GEMINI_BASE_URL}?key=${config.GEMINI_APIKEY}`,
      geminiPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract text from Gemini response
    const text = response.data.candidates[0].content.parts[0].text;
    return text;
  } catch (error: unknown) {
    let errMessage: string;

    if (error instanceof Error) {
      errMessage = error.message;
    } else {
      errMessage = "An unknown error occurred";
    }

    throw new Error(`Gemini API error: ${errMessage}`);
  }
};
