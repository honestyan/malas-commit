import { generateCompletion } from "../api/groqClient";
import { config } from "../config";

export const generateCommitMessage = async (diff: string) => {
  const systemMessage = {
    role: "system" as const,
    content:
      config.COMMIT_PROMPT ||
      `You are an AI responsible for generating meaningful commit messages for code repositories (only one sentence not a paragraph).
        Based on the type of change, include a specific prefix in your commit message:
        - [Add]: For new features, functions, or files.
        - [Fix]: For bug fixes or corrections.
        - [Update]: For updates or modifications to existing code.
        - [Remove]: For deletions of code or functionality.
        - [Chore]: For general tasks, maintenance, or other minor changes.

        example: [Update] (controllers/products.go, controllers/users.go) remove redundant BodyParser calls and directly use validated payload from Locals.
        so it should be like this [Type] (file/s name seperated with comma) $commit_message.
      `,
  };

  const userInputMessage = {
    role: "user" as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
};
