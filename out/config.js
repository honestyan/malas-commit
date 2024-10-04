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
    catch {
        console.log(`Configuration file not found at ${configFilePath}.\n`);
        console.log(`Creating a new configuration file...\n`);
        saveConfig(defaultConfig);
        console.log(`A new configuration file has been created at ${configFilePath}.\n`);
        console.log(`Please update the configuration by running:\n`);
        console.log(`'malas setConfig GROQ_APIKEY <your_apikey>'\n`);
        return defaultConfig;
    }
};
const saveConfig = (config) => {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
};
const loadedConfig = loadConfig();
export const config = {
    GROQ_APIKEY: process.env.GROQ_APIKEY || loadedConfig.GROQ_APIKEY || "",
    COMMIT_PROMPT: process.env.COMMIT_PROMPT || loadedConfig.COMMIT_PROMPT || "",
};
