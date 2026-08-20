import axios from "axios";
import { config } from "../config.js";
const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
export const generateCompletionWithGroq = async (messages, model) => {
    const selectedModel = model || config.GROQ_MODEL || "openai/gpt-oss-120b";
    const apiKey = config.GROQ_APIKEY;
    if (!apiKey) {
        throw new Error("Groq API key is not configured. Run 'malas setConfig GROQ_APIKEY <your_api_key>' to set it.");
    }
    try {
        const response = await axios.post(BASE_URL, {
            model: selectedModel,
            messages,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const apiMessage = error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message;
            if (status === 401) {
                throw new Error(`Invalid or expired Groq API key (${apiMessage}). Update it with 'malas setConfig GROQ_APIKEY <your_key>'`);
            }
            if (status === 404) {
                throw new Error(`Groq model '${selectedModel}' not found or deprecated (${apiMessage}). Try updating your model with 'malas setConfig GROQ_MODEL <model_name>' (e.g., llama-3.3-70b-versatile) or use the --model flag.`);
            }
            if (status === 429) {
                throw new Error(`Groq rate limit or quota exceeded (${apiMessage}). Please wait before retrying or use Gemini fallback.`);
            }
            throw new Error(`Groq API request failed (Status ${status || "unknown"}): ${apiMessage}`);
        }
        if (error instanceof Error) {
            throw new Error(`Groq API error: ${error.message}`);
        }
        throw new Error("Groq API error: An unknown error occurred");
    }
};
