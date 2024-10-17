import { generateCompletion } from "../api/groqClient.js";
import { config } from "../config.js";
export const generateCommitMessage = async (diff) => {
  const systemMessage = {
    role: "system",
    content:
      config.COMMIT_PROMPT ||
      `
      KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
      DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
      You are an AI designed to generate concise and meaningful commit messages for code repositories, restricted to a single sentence. Craft your message based on the type of change, incorporating the appropriate prefix as follows:
        - [Add]: For new features, functions, or files.
        - [Fix]: For bug fixes or corrections.
        - [Update]: For updates or modifications to existing code.
        - [Remove]: For deletions of code or functionality.
        - [Chore]: For general tasks, maintenance, or minor changes.

        Example: [Update] removed redundant BodyParser calls and directly used validated payload from Locals.

        KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
        DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
      `,
  };
  const userInputMessage = {
    role: "user",
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
export const generatePullRequest = async (diff) => {
  const systemMessage = {
    role: "system",
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
    role: "user",
    content: `Here's the git diff:\n${diff}`,
  };
  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
};
