#!/usr/bin/env node
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
  getDiffFromBaseBranch,
  getCommitMessages,
  getCurrentBranch,
  getBaseBranch,
} from "./git/gitUtils";
import os from "os";
import { confirm } from "@clack/prompts";
import { config, loadConfig, saveConfig } from "./config";

const configFilePath = path.join(os.homedir(), ".malas-commit");

const getCharLimit = (): number => {
  if (!config.GROQ_APIKEY && config.GEMINI_APIKEY) {
    return 60000; // Maximized for Gemini's capacity - hits per-minute limit before daily quota
  }

  return 20000;
};

const setConfig = (key: string, value: string) => {
  const currentConfig = loadConfig() as any;
  currentConfig[key] = value;
  saveConfig(currentConfig);
  console.log(`Configuration updated: ${key}=${value}`);
};

const runGenerate = async (model?: string) => {
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

    const charLimit = getCharLimit();
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

    let commitMessage = await generateCommitMessage(truncatedDiff.join("\n"), model);

    let useCommitMessage = await confirm({
      message: `Generated Commit Message: \n\n${commitMessage}\n\nDo you want to use this commit message?`,
      initialValue: true,
    });

    if (useCommitMessage) {
      await gitCommit(commitMessage);
    } else {
      commitMessage = await generateCommitMessage(diff, model);
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

const pullRequest = async (baseArg?: string, model?: string) => {
  try {
    await assertGitRepo();

    const stagedFiles = await getStagedFiles();
    let diff: string;
    let commitMessages: string[] = [];
    let usingStagedFiles = false;

    // Check if there are staged files
    if (stagedFiles.length > 0) {
      // Using staged files (backward compatible)
      console.log("Detecting staged files. Using staged files mode...");
      usingStagedFiles = true;
      diff = await getDiff(stagedFiles);

      if (!diff || diff.length === 0) {
        console.log(
          "No changes detected in the staged files. Please make some changes before generating a pull request description."
        );
        process.exit(1);
      }
    } else {
      // Using commits from branch
      const currentBranch = await getCurrentBranch();
      const baseBranch = baseArg || await getBaseBranch();

      console.log(
        `No staged files detected. Using commits from branch '${currentBranch}' (base: ${baseBranch})...`
      );

      if (currentBranch === baseBranch) {
        console.error(
          `You are currently on the base branch (${baseBranch}). Please switch to a feature branch or stage some files to generate a pull request.`
        );
        process.exit(1);
      }

      // Get commits and diff from base branch
      commitMessages = await getCommitMessages(baseBranch);

      if (commitMessages.length === 0) {
        console.log(
          `No commits found on branch '${currentBranch}' since '${baseBranch}'. Please make some commits or stage some files before generating a pull request description.`
        );
        process.exit(1);
      }

      console.log(
        `Found ${commitMessages.length} commit(s) on branch '${currentBranch}':`
      );
      commitMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg}`);
      });

      diff = await getDiffFromBaseBranch();

      if (!diff || diff.length === 0) {
        console.log(
          "No changes detected in the commits. Please make some changes before generating a pull request description."
        );
        process.exit(1);
      }
    }

    const charLimit = getCharLimit();
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
        `The diff exceeds the character limit (${charLimit}). Truncating the diff.`
      );
      if (usingStagedFiles) {
        truncatedDiff.push("\nStaged Files:\n", ...stagedFiles);
      } else {
        truncatedDiff.push(
          "\nCommit Messages:\n",
          ...commitMessages.map((msg, idx) => `${idx + 1}. ${msg}`)
        );
      }
    }

    let pullRequest = await generatePullRequest(truncatedDiff.join("\n"), model);

    console.log(`\nGenerated Pull Request Description: \n\n${pullRequest}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
};

const argv = yargs(hideBin(process.argv))
  .option("model", {
    alias: "m",
    describe: "AI model to use (e.g. llama-3.3-70b-versatile, gemini-2.0-flash)",
    type: "string",
  })
  .command(
    "setConfig <key> <value>",
    "Set configuration values (e.g. GROQ_APIKEY, GEMINI_APIKEY, GROQ_MODEL, GEMINI_MODEL, COMMIT_PROMPT)",
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
      const key = argv.key as string;
      const value = argv.value as string;
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
      const currentConfig = loadConfig() as any;
      if (argv.key) {
        console.log(`${argv.key}=${currentConfig[argv.key] || "Not Set"}`);
      } else {
        console.log(currentConfig);
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
    (yargs) => {
      return yargs.option("model", {
        alias: "m",
        describe: "AI model to use",
        type: "string",
      });
    },
    async (argv) => {
      await runGenerate(argv.model as string | undefined);
    }
  )
  .command(
    "pr",
    "Generate a pull request description based on staged files",
    (yargs) => {
      return yargs
        .option("base", {
          alias: "b",
          describe: "Base branch for pull request (default: auto-detected)",
          type: "string",
        })
        .option("model", {
          alias: "m",
          describe: "AI model to use",
          type: "string",
        });
    },
    async (argv) => {
      await pullRequest(argv.base as string | undefined, argv.model as string | undefined);
    }
  )
  .help().argv as any;

if (Array.isArray(argv._) && argv._.length === 0) {
  await runGenerate(argv.model as string | undefined);
}

