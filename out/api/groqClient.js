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
export const generateCompletion = async (messages, model = "llama-3.1-8b-instant") => {
    try {
        const response = await groqClient.post("", {
            model,
            messages,
        });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        let errMessage;
        if (error instanceof Error) {
            errMessage = error.message;
        }
        else {
            errMessage = "An unknown error occurred";
        }
        console.error(errMessage);
    }
};
