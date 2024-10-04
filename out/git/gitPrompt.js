import { confirm } from "@clack/prompts";
import { gitAdd, getChangedFiles, getStagedFiles } from "./gitUtils.js";
export const ensureFilesAreStaged = async () => {
  const changedFiles = await getChangedFiles();
  const stagedFiles = await getStagedFiles();
  if (stagedFiles.length === 0) {
    if (changedFiles.length > 0) {
      const shouldAddFiles = await confirm({
        message:
          'You have untracked/modified files. Do you want to run "git add ." on them?',
      });
      if (shouldAddFiles) {
        await gitAdd(changedFiles);
      } else {
        console.log(
          "Please stage at least one file before generating the commit message. Exiting..."
        );
        process.exit(1);
      }
    } else {
      console.log(
        "No changes detected. Please modify or add files before generating a commit message. Exiting..."
      );
      process.exit(1);
    }
  }
};
