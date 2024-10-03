import fs from "fs";
import path from "path";
import os from "os";

const configFilePath = path.join(os.homedir(), ".malas-commit");
interface Config {
  GROQ_APIKEY?: string;
  COMMIT_PROMPT?: string;
}

let loadedConfig: Config = {};

const loadConfig = () => {
  try {
    const configFile = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configFile);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `Failed to load config from ${configFilePath}: ${err.message}
        run 'malas setConfig GROQ_APIKEY <your-apikey>'`
      );
    } else {
      console.error(`Failed to load config from ${configFilePath}: ${err}
      run 'malas setConfig GROQ_APIKEY <your-apikey>'`);
    }
    return {};
  }
};

loadedConfig = loadConfig();

export const config = {
  GROQ_APIKEY: process.env.GROQ_APIKEY || loadedConfig.GROQ_APIKEY || "",
  COMMIT_PROMPT: process.env.COMMIT_PROMPT || loadedConfig.COMMIT_PROMPT || "",
};
