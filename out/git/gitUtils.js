import { execa } from "execa";
import { readFileSync } from "fs";
import ignore from "ignore";
export const assertGitRepo = async () => {
    try {
        await execa("git", ["rev-parse"]);
    }
    catch (error) {
        throw new Error("Not a Git repository");
    }
};
export const getStagedFiles = async () => {
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
    if (!files)
        return [];
    const filesList = files.split("\n");
    const ig = getMalasCommitIgnore();
    return filesList.filter((file) => !ig.ignores(file)).sort();
};
const getMalasCommitIgnore = () => {
    const ig = ignore();
    try {
        ig.add(readFileSync(".malas-commitignore").toString().split("\n"));
    }
    catch (e) { }
    return ig;
};
export const getChangedFiles = async () => {
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
export const gitAdd = async (files) => {
    await execa("git", ["add", ...files]);
};
export const getDiff = async (files) => {
    const { stdout: diff } = await execa("git", [
        "diff",
        "--staged",
        "--",
        ...files,
    ]);
    return diff;
};
export const gitCommit = async (commitMessage) => {
    try {
        await execa("git", ["commit", "-m", commitMessage]);
        console.log(`Successfully committed with message: "${commitMessage}"`);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to commit changes: ${error.message}`);
        }
        else {
            throw new Error("Failed to commit changes due to an unknown error");
        }
    }
};
