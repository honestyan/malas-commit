import axios from "axios";
import { config } from "../config";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

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
  messages: Message[],
  model?: string
): Promise<string> => {
  const selectedModel = model || config.GEMINI_MODEL || "gemini-3.6-flash";
  const apiKey = config.GEMINI_APIKEY;

  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Run 'malas setConfig GEMINI_APIKEY <your_api_key>' to set it."
    );
  }

  try {
    const geminiPayload = convertMessagesToGeminiFormat(messages);

    const response = await axios.post(
      `${GEMINI_BASE_URL}/${selectedModel}:generateContent?key=${apiKey}`,
      geminiPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract text from Gemini response
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const apiMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;

      if (status === 400 || status === 401) {
        throw new Error(
          `Invalid Gemini API request or key (${apiMessage}). Update it with 'malas setConfig GEMINI_APIKEY <your_key>'`
        );
      }
      if (status === 404) {
        throw new Error(
          `Gemini model '${selectedModel}' not found (${apiMessage}). Try updating your model with 'malas setConfig GEMINI_MODEL <model_name>' (e.g., gemini-2.0-flash) or use the --model flag.`
        );
      }
      if (status === 429) {
        throw new Error(
          `Gemini rate limit or quota exceeded (${apiMessage}). Please wait before retrying.`
        );
      }

      throw new Error(
        `Gemini API request failed (Status ${status || "unknown"}): ${apiMessage}`
      );
    }

    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }

    throw new Error("Gemini API error: An unknown error occurred");
  }
};

