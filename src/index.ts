#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ensureFilesAreStaged } from "./git/gitPrompt";
import {
  generateCommitMessage,
  generatePullRequest,
} from "./services/commitService";
import {
  getDiff,
  getStagedFiles,
  assertGitRepo,
  gitCommit,
} from "./git/gitUtils";
import os from "os";
import { confirm } from "@clack/prompts";

const configFilePath = path.join(os.homedir(), ".malas-commit");

const loadConfig = (): any => {
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

const saveConfig = (config: any) => {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
};

const setConfig = (key: string, value: string) => {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  console.log(`Configuration updated: ${key}=${value}`);
};

const runGenerate = async () => {
  try {
    await assertGitRepo();
    await ensureFilesAreStaged();

    const stagedFiles = await getStagedFiles();
    const diff = await getDiff(stagedFiles);

    if (!diff || diff.length === 0) {
      console.log(
        "No changes detected in the staged files. Please make some changes before generating a commit message."
      );
      process.exit(1);
    }

    const charLimit = 5000;
    let charCount = 0;
    let truncatedDiff: string[] = [];

    const diffLines = diff.split("\n");

    for (const line of diffLines) {
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

    let useCommitMessage = await confirm({
      message: `Generated Commit Message: \n\n${commitMessage}\n\nDo you want to use this commit message?`,
      initialValue: true,
    });

    if (useCommitMessage) {
      await gitCommit(commitMessage);
    } else {
      commitMessage = await generateCommitMessage(diff);
      useCommitMessage = await confirm({
        message: `Regenerated Commit Message: \n\n${commitMessage}\n\nDo you want to use this commit message?`,
        initialValue: true,
      });

      if (useCommitMessage) {
        await gitCommit(commitMessage);
      } else {
        console.log("You opted not to use the generated commit message.");
        process.exit(1);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
};

const pullRequest = async () => {
  try {
    await assertGitRepo();
    await ensureFilesAreStaged();

    const stagedFiles = await getStagedFiles();
    const diff = await getDiff(stagedFiles);

    if (!diff || diff.length === 0) {
      console.log(
        "No changes detected in the staged files. Please make some changes before generating a pull request description."
      );
      process.exit(1);
    }

    const charLimit = 5000;
    let charCount = 0;
    let truncatedDiff: string[] = [];

    const diffLines = diff.split("\n");

    for (const line of diffLines) {
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

    let pullRequest = await generatePullRequest(truncatedDiff.join("\n"));

    console.log(`Generated Pull Request Description: \n\n${pullRequest}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
};

const argv = yargs(hideBin(process.argv))
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
      loadConfig();
      const key = argv.key as string;
      const value = argv.value as string;
      setConfig(key, value);
      console.log(`Configuration updated: ${key}=${value}`);
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
  .command(
    "pr",
    "Generate a pull request description based on staged files",
    async () => {},
    async () => {
      await pullRequest();
    }
  )
  .help().argv as any;

if (Array.isArray(argv._) && argv._.length === 0) {
  await runGenerate();
}
