import { generateCompletion } from "../api/groqClient";
import { config } from "../config";

export const generateCommitMessage = async (diff: string) => {
  const systemMessage = {
    role: "system" as const,
    content:
      config.COMMIT_PROMPT ||
      `
      KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
      DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
      You are an AI designed to generate concise and meaningful commit messages for code repositories, restricted to a single sentence. Craft your message based on the type of change, use set of rules for writing commit messages from conventionalcommits.org follow these guidelines!, incorporating the appropriate prefix as follows:
      The website proposes a set of rules for writing commit messages, including:
      1. **Type**: A prefix (such as feat, fix, docs, etc.) that indicates the type of change being made.
      2. **Scope**: A short summary of the changes being made, in the present tense.
      3. **Description**: A brief description of the changes, usually one or two sentences.
      4. **Footer**: Optional information, such as breaking changes, deprecation info, or a reference to an issue or PR.

      By following these guidelines, Conventional Commits aims to promote clarity, consistency, and maintainability in commit messages, making it easier for developers to understand and manage changes in their project history.

      Example: [Update] removed redundant BodyParser calls and directly used validated payload from Locals.

      KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
      DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
      `,
  };

  const userInputMessage = {
    role: "user" as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  try {
    const commitMessage = await generateCompletion(messages);

    if (
      !commitMessage ||
      commitMessage.includes("undefined") ||
      commitMessage.includes("Here is") ||
      commitMessage.includes("here is") ||
      commitMessage.includes("here's") ||
      commitMessage.includes("Here's") ||
      commitMessage.includes("Commit") ||
      commitMessage.includes("commit")
    ) {
      throw new Error("Invalid commit message generated.");
    }
    return commitMessage;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to generate commit message: ${error.message}`);
    } else {
      console.error("Failed to generate commit message: Unknown error");
    }
    process.exit(1);
  }
};

export const generatePullRequest = async (diff: string) => {
  const systemMessage = {
    role: "system" as const,
    content: `
      KEEP IN MIND THAT YOU SHOULD ONLY REPLY WITH THE PULL REQUEST TITLE AND DESCRIPTION IN MARKDOWN FORMAT! DO NOT INCLUDE ANY OTHER TEXT OR COMMENTS.

      You are an AI designed to generate a concise and informative pull request title and a detailed description in Markdown format. The title should be short and informative, while the description should be structured into multiple sections to provide thorough context about the changes.

      Use the following guidelines for generating the pull request title and description:

      ### PR Title
      - The PR title should summarize the change in a single sentence, no more than 60 characters.

      ### PR Description

      ...
      
      KEEP IN MIND THAT YOU SHOULD ONLY REPLY WITH THE PULL REQUEST TITLE AND DESCRIPTION IN MARKDOWN FORMAT! DO NOT INCLUDE ANY OTHER TEXT OR COMMENTS.
      `,
  };

  const userInputMessage = {
    role: "user" as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
};
