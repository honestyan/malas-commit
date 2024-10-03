import fs from "fs";
import path from "path";
import os from "os";
const configFilePath = path.join(os.homedir(), ".malas-commit");
const defaultConfig = {
    GROQ_APIKEY: "",
    COMMIT_PROMPT: "",
};
const loadConfig = () => {
    try {
        const configFile = fs.readFileSync(configFilePath, "utf-8");
        return JSON.parse(configFile);
    }
    catch (err) {
        console.warn(`Failed to load config from ${configFilePath}: ${err instanceof Error ? err.message : String(err)}\n\n\n Run 'malas setConfig GROQ_APIKEY <your_apikey>' \n\n\n`);
        saveConfig(defaultConfig);
        return defaultConfig;
    }
};
const saveConfig = (config) => {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`Configuration file created at: ${configFilePath}`);
};
const loadedConfig = loadConfig();
export const config = {
    GROQ_APIKEY: process.env.GROQ_APIKEY || loadedConfig.GROQ_APIKEY || "",
    COMMIT_PROMPT: process.env.COMMIT_PROMPT || loadedConfig.COMMIT_PROMPT || "",
};
