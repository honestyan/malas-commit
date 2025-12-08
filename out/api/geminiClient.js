import axios from "axios";
import { config } from "../config.js";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
/**
 * Converts OpenAI-style messages to Gemini format
 */
const convertMessagesToGeminiFormat = (messages) => {
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");
    const systemInstruction = systemMessages.length > 0
        ? {
            parts: systemMessages.map((msg) => ({ text: msg.content })),
        }
        : undefined;
    const contents = conversationMessages.map((msg) => ({
        parts: [{ text: msg.content }],
    }));
    return {
        system_instruction: systemInstruction,
        contents,
    };
};
export const generateCompletionWithGemini = async (messages) => {
    try {
        const geminiPayload = convertMessagesToGeminiFormat(messages);
        const response = await axios.post(`${GEMINI_BASE_URL}?key=${config.GEMINI_APIKEY}`, geminiPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // Extract text from Gemini response
        const text = response.data.candidates[0].content.parts[0].text;
        return text;
    }
    catch (error) {
        let errMessage;
        if (error instanceof Error) {
            errMessage = error.message;
        }
        else {
            errMessage = "An unknown error occurred";
        }
        throw new Error(`Gemini API error: ${errMessage}`);
    }
};
