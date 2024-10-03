import axios from "axios";
import { config } from "../config.js";

const BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

export const groqClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${config.GROQ_APIKEY}`,
    "Content-Type": "application/json",
  },
});

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const generateCompletion = async (
  messages: Message[],
  model = "llama3-8b-8192"
) => {
  try {
    const response = await groqClient.post("", {
      model,
      messages,
    });
    return response.data.choices[0].message.content;
  } catch (error: unknown) {
    let errMessage: string;

    if (error instanceof Error) {
      errMessage = error.message;
    } else {
      errMessage = "An unknown error occurred";
    }

    console.error(errMessage);
  }
};
