#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ensureFilesAreStaged } from "./git/gitPrompt.js";
import { generateCommitMessage } from "./services/commitService.js";
import {
  getDiff,
  getStagedFiles,
  assertGitRepo,
  gitCommit,
  gitAdd,
  gitPush,
} from "./git/gitUtils.js";
import os from "os";
import { confirm } from "@clack/prompts";
const configFilePath = path.join(os.homedir(), ".malas-commit");
const loadConfig = () => {
  if (!fs.existsSync(configFilePath)) {
    console.warn(
      `Configuration file not found: ${configFilePath}. Creating a new one.`
    );
    saveConfig({});
    return {};
  }
  try {
    const configFile = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(configFile);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error reading config: ${err.message}`);
    } else {
      console.error(`Error reading config: ${String(err)}`);
    }
    return {};
  }
};
const saveConfig = (config) => {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
};
const setConfig = (key, value) => {
  let config = {};
  if (fs.existsSync(configFilePath)) {
    config = loadConfig();
  } else {
    console.log(
      `Configuration file not found: ${configFilePath}. Creating a new one with the provided settings.`
    );
  }
  config[key] = value;
  saveConfig(config);
  console.log(`Configuration updated: ${key}=${value}`);
};
const runGenerate = async (autoCommit = false) => {
  try {
    await assertGitRepo();
    // Automatically stage files if `-y` is used
    if (autoCommit) {
      const changedFiles = await getStagedFiles();
      await gitAdd(changedFiles);
    } else {
      await ensureFilesAreStaged();
    }
    const stagedFiles = await getStagedFiles();
    let diff = await getDiff(stagedFiles);
    if (!diff || diff.length === 0) {
      console.log(
        "No changes detected in the staged files. Please make some changes before generating a commit message."
      );
      process.exit(1);
    }
    const charLimit = 50000;
    let charCount = 0;
    let truncatedDiff = [];
    for (const line of diff) {
      charCount += line.length;
      if (charCount > charLimit) break;
      truncatedDiff.push(line);
    }
    if (charCount > charLimit) {
      console.warn(
        `The diff exceeds the character limit (${charLimit}). Truncating the diff and adding staged file names.`
      );
      truncatedDiff.push("\nStaged Files:\n", ...stagedFiles);
    }
    let commitMessage = await generateCommitMessage(truncatedDiff.join("\n"));
    if (!autoCommit) {
      let useCommitMessage = await confirm({
        message: `Generated Commit Message: \n\n${commitMessage}\n\nDo you want to use this commit message?`,
        initialValue: true,
      });
      if (useCommitMessage) {
        await gitCommit(commitMessage);
      } else {
        console.log("You opted not to use the generated commit message.");
        process.exit(1);
      }
    } else {
      // Automatically commit and push if `-y` is used
      await gitCommit(commitMessage);
      await gitPush();
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
    process.exit(2);
  }
};
const argv = yargs(hideBin(process.argv))
  .option("y", {
    alias: "yes",
    type: "boolean",
    description: "Automatically commit and push without confirmation",
  })
  .command(
    "setConfig <key> <value>",
    "Set configuration values",
    (yargs) => {
      return yargs
        .positional("key", {
          describe: "Config key",
          type: "string",
        })
        .positional("value", {
          describe: "Config value",
          type: "string",
        });
    },
    (argv) => {
      const key = argv.key;
      const value = argv.value;
      setConfig(key, value);
    }
  )
  .command(
    "getConfig [key]",
    "Get configuration value",
    (yargs) => {
      return yargs.positional("key", {
        describe: "Config key (optional)",
        type: "string",
      });
    },
    (argv) => {
      const config = loadConfig();
      if (argv.key) {
        console.log(`${argv.key}=${config[argv.key] || "Not Set"}`);
      } else {
        console.log(config);
      }
    }
  )
  .command(
    "getConfigPath",
    "Get the path of the configuration file",
    () => {},
    () => {
      console.log(`Configuration file path: ${configFilePath}`);
    }
  )
  .command(
    "generate",
    "Generate a commit message based on staged files",
    async () => {},
    async () => {
      await runGenerate();
    }
  )
  .help().argv;
if (Array.isArray(argv._) && argv._.length === 0) {
  await runGenerate();
}
