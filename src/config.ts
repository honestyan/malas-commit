import fs from "fs";
import path from "path";
import os from "os";

const configFilePath = path.join(os.homedir(), ".malas-commit");

interface Config {
  GROQ_APIKEY?: string;
  COMMIT_PROMPT?: string;
}

const defaultConfig: Config = {
  GROQ_APIKEY: "",
  COMMIT_PROMPT: "",
};

const loadConfig = (): Config => {
  try {
    const configFile = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configFile);
  } catch (err) {
    console.warn(
      `Failed to load config from ${configFilePath}: ${
        err instanceof Error ? err.message : String(err)
      }\n\nCreating a new configuration file...`
    );

    saveConfig(defaultConfig);

    throw new Error(
      `Configuration file created at ${configFilePath}. Please update the configuration.\n\n\nRun 'malas setConfig GROQ_APIKEY <your_apikey>' to set your API key.\n\n\n`
    );
  }
};

const saveConfig = (config: Config) => {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
};

const loadedConfig: Config = loadConfig();

export const config = {
  GROQ_APIKEY: process.env.GROQ_APIKEY || loadedConfig.GROQ_APIKEY || "",
  COMMIT_PROMPT: process.env.COMMIT_PROMPT || loadedConfig.COMMIT_PROMPT || "",
};
