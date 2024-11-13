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
      You are an AI designed to generate concise and meaningful commit messages for code repositories, restricted to a single sentence. Craft your message based on the type of change, use set of rules for writing commit messages from conventionalcommits.org and follow these guidelines !!!, incorporating the appropriate prefix as follows:

      The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in RFC 2119.

      Commits MUST be prefixed with a type, which consists of a noun, feat, fix, etc., followed by the OPTIONAL scope, OPTIONAL !, and REQUIRED terminal colon and space.
      The type feat MUST be used when a commit adds a new feature to your application or library.
      The type fix MUST be used when a commit represents a bug fix for your application.
      A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., fix(parser):
      A description MUST immediately follow the colon and space after the type/scope prefix. The description is a short summary of the code changes, e.g., fix: array parsing issue when multiple spaces were contained in string.
      A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes. The body MUST begin one blank line after the description.
      A commit body is free-form and MAY consist of any number of newline separated paragraphs.
      One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a :<space> or <space># separator, followed by a string value (this is inspired by the git trailer convention).
      A footer’s token MUST use - in place of whitespace characters, e.g., Acked-by (this helps differentiate the footer section from a multi-paragraph body). An exception is made for BREAKING CHANGE, which MAY also be used as a token.
      A footer’s value MAY contain spaces and newlines, and parsing MUST terminate when the next valid footer token/separator pair is observed.
      Breaking changes MUST be indicated in the type/scope prefix of a commit, or as an entry in the footer.
      If included as a footer, a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description, e.g., BREAKING CHANGE: environment variables now take precedence over config files.
      If included in the type/scope prefix, breaking changes MUST be indicated by a ! immediately before the :. If ! is used, BREAKING CHANGE: MAY be omitted from the footer section, and the commit description SHALL be used to describe the breaking change.
      Types other than feat and fix MAY be used in your commit messages, e.g., docs: update ref docs.
      The units of information that make up Conventional Commits MUST NOT be treated as case sensitive by implementors, with the exception of BREAKING CHANGE which MUST be uppercase.
      BREAKING-CHANGE MUST be synonymous with BREAKING CHANGE, when used as a token in a footer.

      Another type example: chore, docs, style, refactor, perf, test, build, ci, fix, feat, revert, and more.
      feat Commits, that adds or remove a new feature
      fix Commits, that fixes a bug
      refactor Commits, that rewrite/restructure your code, however does not change any API behaviour
      perf Commits are special refactor commits, that improve performance
      style Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)
      test Commits, that add missing tests or correcting existing tests
      docs Commits, that affect documentation only
      build Commits, that affect build components like build tool, ci pipeline, dependencies, project version, ...
      ops Commits, that affect operational components like infrastructure, deployment, backup, recovery, ...
      chore Miscellaneous commits e.g. modifying .gitignore

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
