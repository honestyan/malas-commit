import { confirm } from "@clack/prompts";
import { gitAdd, getChangedFiles } from "./gitUtils";

export const ensureFilesAreStaged = async () => {
  const changedFiles = await getChangedFiles();
  if (changedFiles.length === 0) return;

  const shouldAddFiles = await confirm({
    message:
      'You have untracked/modified files. Do you want to run "git add" on them?',
  });

  if (shouldAddFiles) {
    await gitAdd(changedFiles);
  } else {
    throw new Error(
      "Please stage your changes before generating the commit message."
    );
  }
};
