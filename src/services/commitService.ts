import { generateCompletion } from "../api/groqClient";
import { config } from "../config";

export const generateCommitMessage = async (diff: string) => {
  const systemMessage = {
    role: "system" as const,
    content:
      config.COMMIT_PROMPT ||
      `
    You are an AI assistant tasked with generating semantic commit messages following the Conventional Commits specification.
    KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
      DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
    Adhere strictly to the provided format and guidelines:

    1. Format:
       <type>[optional scope]: <subject>
       
       - <type> MUST be one of the following:
         - feat: (introducing a new feature)
         - fix: (fixing a bug)
         - docs: (updating documentation)
         - style: (formatting or style changes; no code changes)
         - refactor: (code restructuring without functionality change)
         - test: (adding or updating tests)
         - chore: (updating build scripts or other tasks without code changes)

       - [optional scope]: Scope is a noun describing a part of the codebase. For example:
         - (api): For API-related changes
         - (middleware): For changes in middleware
         - etc.
         - Leave empty if the scope is global or not specific.

       - <subject>: A concise description of the change, written in present tense, without a period at the end.

    2. Additional Guidelines:
       - Keep the message concise and limited to 70 characters in the first line.
       - Avoid adding additional context, explanations, or headers like "Here is the commit message".
       - If the change includes a breaking change, use the format:
         <type>(<scope>)!: <subject>
         BREAKING CHANGE: <details about the breaking change>.

    3. Example messages:
       - feat(api): add support for user authentication
       - fix(middleware): resolve crash when parsing headers

    STRICTLY FOLLOW THIS FORMAT. DO NOT ADD ANY ADDITIONAL INFORMATION OR HEADERS. ONLY RETURN THE COMMIT MESSAGE ITSELF.
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
