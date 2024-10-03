import { generateCommitMessage } from "../src/services/commitService";
import { generateCompletion } from "../src/api/groqClient";

jest.mock("../src/api/groqClient", () => ({
  generateCompletion: jest.fn(),
}));

describe("generateCommitMessage", () => {
  const originalPrompt = `You are an AI responsible for generating meaningful commit messages for code repositories (only one sentence not a paragraph).
        Based on the type of change, include a specific prefix in your commit message:
        - [Add]: For new features, functions, or files.
        - [Fix]: For bug fixes or corrections.
        - [Update]: For updates or modifications to existing code.
        - [Remove]: For deletions of code or functionality.
        - [Chore]: For general tasks, maintenance, or other minor changes.

        example: [Update] (controllers/products.go, controllers/users.go) remove redundant BodyParser calls and directly use validated payload from Locals.
        so it should be like this [Type] (file/s name seperated with comma) $commit_message.
        
        Use the appropriate prefix before the actual message you generate.
      `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a commit message for no changes", async () => {
    const diff = "";

    (generateCompletion as jest.Mock).mockResolvedValue("Mock commit message");

    const commitMessage = await generateCommitMessage(diff);

    expect(commitMessage).toBe("Mock commit message");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: "Here's the git diff:\n",
      },
    ]);
  });

  it("should generate a commit message for a normal diff", async () => {
    const diff = `diff --git a/file.txt b/file.txt
index 83db48f..f735c8b 100644
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-Hello World
+Hello Universe`;

    (generateCompletion as jest.Mock).mockResolvedValue(
      "Updated the greeting message"
    );

    const commitMessage = await generateCommitMessage(diff);

    expect(commitMessage).toBe("Updated the greeting message");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: `Here's the git diff:\n${diff}`,
      },
    ]);
  });

  it("should generate a commit message for multiple changes in a diff", async () => {
    const diff = `diff --git a/file1.txt b/file1.txt
index 83db48f..f735c8b 100644
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
-Hello World
+Hello Universe
diff --git a/file2.txt b/file2.txt
index a3b4c5d..e6f7g8h 100644
--- a/file2.txt
+++ b/file2.txt
@@ -1,3 +1,3 @@
-Old line 1
+New line 1
 Old line 2
-Old line 3
+New line 3`;

    (generateCompletion as jest.Mock).mockResolvedValue(
      "Updated greeting and changed lines in file2."
    );

    const commitMessage = await generateCommitMessage(diff);

    expect(commitMessage).toBe("Updated greeting and changed lines in file2.");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: `Here's the git diff:\n${diff}`,
      },
    ]);
  });

  it("should generate a commit message for added files", async () => {
    const diff = `diff --git a/newFile.txt b/newFile.txt
new file mode 100644
index 0000000..c3f2e7b
--- /dev/null
+++ b/newFile.txt
@@ -0,0 +1 @@
+This is a new file.`;

    (generateCompletion as jest.Mock).mockResolvedValue(
      "Added newFile.txt with initial content."
    );

    const commitMessage = await generateCommitMessage(diff);

    expect(commitMessage).toBe("Added newFile.txt with initial content.");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: `Here's the git diff:\n${diff}`,
      },
    ]);
  });

  it("should handle an invalid diff format", async () => {
    const diff = "invalid diff format";

    (generateCompletion as jest.Mock).mockResolvedValue(
      "Invalid diff received, no changes made"
    );

    const commitMessage = await generateCommitMessage(diff);

    expect(commitMessage).toBe("Invalid diff received, no changes made");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: `Here's the git diff:\n${diff}`,
      },
    ]);
  });

  it("should handle API failure", async () => {
    const diff = `diff --git a/file.txt b/file.txt
index 83db48f..f735c8b 100644
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-Hello World
+Hello Universe`;

    (generateCompletion as jest.Mock).mockRejectedValue(new Error("API error"));

    await expect(generateCommitMessage(diff)).rejects.toThrow("API error");
    expect(generateCompletion).toHaveBeenCalledWith([
      {
        role: "system",
        content: originalPrompt,
      },
      {
        role: "user",
        content: `Here's the git diff:\n${diff}`,
      },
    ]);
  });
});
