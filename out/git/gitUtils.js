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
export const gitPush = async () => {
    try {
        await execa("git", ["push"]);
        console.log("Successfully pushed changes to remote repository");
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to push changes: ${error.message}`);
        }
        else {
            throw new Error("Failed to push changes due to an unknown error");
        }
    }
};
export const getCurrentBranch = async () => {
    try {
        const { stdout: branch } = await execa("git", [
            "rev-parse",
            "--abbrev-ref",
            "HEAD",
        ]);
        return branch;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get current branch: ${error.message}`);
        }
        else {
            throw new Error("Failed to get current branch due to an unknown error");
        }
    }
};
export const getBaseBranch = async () => {
    try {
        // Try to find main branch
        const { stdout: mainExists } = await execa("git", [
            "rev-parse",
            "--verify",
            "main",
        ]).catch(() => ({ stdout: "" }));
        if (mainExists) {
            return "main";
        }
        // Try to find master branch
        const { stdout: masterExists } = await execa("git", [
            "rev-parse",
            "--verify",
            "master",
        ]).catch(() => ({ stdout: "" }));
        if (masterExists) {
            return "master";
        }
        // If neither exists, try to get default branch from remote
        const { stdout: defaultBranch } = await execa("git", [
            "symbolic-ref",
            "refs/remotes/origin/HEAD",
        ])
            .then((result) => ({
            stdout: result.stdout.replace("refs/remotes/origin/", ""),
        }))
            .catch(() => ({ stdout: "main" }));
        return defaultBranch;
    }
    catch (error) {
        // Default to main if all else fails
        return "main";
    }
};
export const getCommitsSinceBaseBranch = async () => {
    try {
        const currentBranch = await getCurrentBranch();
        const baseBranch = await getBaseBranch();
        if (currentBranch === baseBranch) {
            throw new Error(`You are currently on the base branch (${baseBranch}). Please switch to a feature branch to generate a pull request.`);
        }
        const { stdout: commits } = await execa("git", [
            "log",
            `${baseBranch}..HEAD`,
            "--pretty=format:%H %s",
        ]);
        if (!commits) {
            return [];
        }
        return commits.split("\n").filter((commit) => !!commit);
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        else {
            throw new Error("Failed to get commits since base branch due to an unknown error");
        }
    }
};
export const getDiffFromBaseBranch = async () => {
    try {
        const baseBranch = await getBaseBranch();
        const { stdout: diff } = await execa("git", [
            "diff",
            `${baseBranch}...HEAD`,
        ]);
        return diff;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get diff from base branch: ${error.message}`);
        }
        else {
            throw new Error("Failed to get diff from base branch due to an unknown error");
        }
    }
};
export const getCommitMessages = async (targetBranch) => {
    try {
        const baseBranch = targetBranch || await getBaseBranch();
        const { stdout: messages } = await execa("git", [
            "log",
            `${baseBranch}..HEAD`,
            "--pretty=format:%s",
        ]);
        if (!messages) {
            return [];
        }
        return messages.split("\n").filter((msg) => !!msg);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get commit messages: ${error.message}`);
        }
        else {
            throw new Error("Failed to get commit messages due to an unknown error");
        }
    }
};
