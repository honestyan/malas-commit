import fs from "fs";
import path from "path";
import os from "os";
const configFilePath = path.join(os.homedir(), ".malas-commit");
const defaultConfig = {
    GROQ_APIKEY: "",
    GEMINI_APIKEY: "",
    GROQ_MODEL: "openai/gpt-oss-120b",
    GEMINI_MODEL: "gemini-3.6-flash",
    COMMIT_PROMPT: "",
};
export const loadConfig = () => {
    try {
        if (fs.existsSync(configFilePath)) {
            const configFile = fs.readFileSync(configFilePath, "utf-8");
            return JSON.parse(configFile);
        }
        saveConfig(defaultConfig);
        return defaultConfig;
    }
    catch {
        return defaultConfig;
    }
};
export const saveConfig = (config) => {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
};
export const config = {
    get GROQ_APIKEY() {
        return process.env.GROQ_APIKEY || loadConfig().GROQ_APIKEY || "";
    },
    get GEMINI_APIKEY() {
        return process.env.GEMINI_APIKEY || loadConfig().GEMINI_APIKEY || "";
    },
    get GROQ_MODEL() {
        return process.env.GROQ_MODEL || loadConfig().GROQ_MODEL || "openai/gpt-oss-120b";
    },
    get GEMINI_MODEL() {
        return process.env.GEMINI_MODEL || loadConfig().GEMINI_MODEL || "gemini-3.6-flash";
    },
    get COMMIT_PROMPT() {
        return process.env.COMMIT_PROMPT || loadConfig().COMMIT_PROMPT || "";
    },
};
