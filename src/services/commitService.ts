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
      You are an AI designed to generate concise and meaningful commit messages for code repositories, restricted to a single sentence. Craft your message based on the type of change, incorporating the appropriate prefix as follows:
        - [Add]: For new features, functions, or files.
        - [Fix]: For bug fixes or corrections.
        - [Update]: For updates or modifications to existing code.
        - [Remove]: For deletions of code or functionality.
        - [Chore]: For general tasks, maintenance, or minor changes.

        Example: [Update] (controllers/products.go, controllers/users.go) removed redundant BodyParser calls and directly used validated payload from Locals.

        Formatting Guidelines:
        1. If the combined length of the file names is 60 characters or fewer, format your message as follows:
        - '[Type] (file/s name separated by commas) $commit_message'
        2. If the combined length exceeds 60 characters, omit the file list:
        - '[Type] $commit_message'
        (do not include the prefix in the message).

        KEEP IN MIND THAT STICK TO THE POINT TO ONLY REPLY WITH MY PROMPTED MESSAGE!!! DO NOT ADD ANY ADDITIONAL INFORMATION !!!
        DO NOT SAY "Here is the commit message" OR SUCH LIKE THAT. JUST REPLY ONLY THE COMMIT MESSAGE ITSELF !!!
      `,
  };

  const userInputMessage = {
    role: "user" as const,
    content: `Here's the git diff:\n${diff}`,
  };

  const messages = [systemMessage, userInputMessage];
  return await generateCompletion(messages);
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
      - Preface the title with the appropriate tag (Add, Fix, Update, Remove, Chore) similar to commit messages.

      ### PR Description Sections

      1. **Summary**: A concise explanation of what the changes do.
      2. **Motivation**: Why these changes were necessary. Explain the problem or the reason behind the changes.
      3. **Changes**: A detailed breakdown of the major changes in the code. 
         - Include relevant file names, methods, or functions affected.
         - Briefly describe the purpose of each change.
      4. **Impact**: How the changes affect the project (e.g., bug fix, new feature, performance improvements).
      5. **Testing**: Describe how the changes were tested. 
         - Include steps to reproduce the issue or validate the fix.
         - Mention any new or modified unit or integration tests.
      6. **Breaking Changes**: (Optional) List any changes that could break existing functionality.
      7. **Additional Considerations**: (Optional) Mention any other details that may affect the codebase, like dependencies, configuration changes, or performance implications.

      ### Example Output

      # [Add] Implement caching for user requests

      ## Summary
      This PR introduces a caching mechanism for user data requests to improve performance by reducing the number of database queries.

      ## Motivation
      Frequent database queries for user data were causing performance bottlenecks, leading to slower response times.

      ## Changes
      - **cacheService.ts**: Created a new caching service for storing and retrieving cached user data.
      - **userController.ts**: Updated the controller to use the caching service for GET user requests.
      - **cacheMiddleware.ts**: Added middleware to handle cache invalidation when user data is updated.
      - **tests/cacheService.test.ts**: Added unit tests for the caching service.
      - **tests/userController.test.ts**: Updated tests to account for cached user data responses.

      ## Impact
      This change significantly improves response times for repeated user requests, reducing database load.

      ## Testing
      - Manual testing using Postman to verify the cached response for repeated user requests.
      - Added automated unit tests for the caching service.
      - Integration tests ensure that data invalidation works as expected when user information is updated.

      ## Breaking Changes
      None.

      ## Additional Considerations
      - Ensure that the Redis server is running for caching to work properly.
      - No additional configuration changes are required.
      
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
