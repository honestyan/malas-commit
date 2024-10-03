import { execa } from "execa";
import { readFileSync } from "fs";
import ignore, { Ignore } from "ignore";

export const assertGitRepo = async () => {
  try {
    await execa("git", ["rev-parse"]);
  } catch (error) {
    throw new Error("Not a Git repository");
  }
};

export const getStagedFiles = async (): Promise<string[]> => {
  const { stdout: gitDir } = await execa("git", [
    "rev-parse",
    "--show-toplevel",
  ]);
  const { stdout: files } = await execa("git", [
    "diff",
    "--name-only",
    "--cached",
    "--relative",
    gitDir,
  ]);
  if (!files) return [];
  const filesList = files.split("\n");

  const ig = getMalasCommitIgnore();
  return filesList.filter((file: string) => !ig.ignores(file)).sort();
};

const getMalasCommitIgnore = (): Ignore => {
  const ig = ignore();
  try {
    ig.add(readFileSync(".malas-commitignore").toString().split("\n"));
  } catch (e) {}
  return ig;
};

export const getChangedFiles = async (): Promise<string[]> => {
  const { stdout: modified } = await execa("git", ["ls-files", "--modified"]);
  const { stdout: others } = await execa("git", [
    "ls-files",
    "--others",
    "--exclude-standard",
  ]);
  return [...modified.split("\n"), ...others.split("\n")]
    .filter((file) => !!file)
    .sort();
};

export const gitAdd = async (files: string[]) => {
  await execa("git", ["add", ...files]);
};

export const getDiff = async (files: string[]): Promise<string> => {
  const { stdout: diff } = await execa("git", [
    "diff",
    "--staged",
    "--",
    ...files,
  ]);
  return diff;
};

export const gitCommit = async (commitMessage: string) => {
  try {
    await execa("git", ["commit", "-m", commitMessage]);
    console.log(`Successfully committed with message: "${commitMessage}"`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to commit changes: ${error.message}`);
    } else {
      throw new Error("Failed to commit changes due to an unknown error");
    }
  }
};
