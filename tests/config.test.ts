import { Config, formatConfig } from "../src/config";

it("formats current configuration without exposing API keys", () => {
  const values: Config = {
    GROQ_APIKEY: "groq-secret-abcd",
    GEMINI_APIKEY: "tiny",
    GROQ_MODEL: "groq-model",
    GEMINI_MODEL: "gemini-model",
    COMMIT_PROMPT: "Write a concise commit message",
  };

  const output = formatConfig(values);

  expect(output).toContain("GROQ_APIKEY    ********abcd");
  expect(output).toContain("GEMINI_APIKEY  ********");
  expect(output).toContain("GROQ_MODEL     groq-model");
  expect(output).toContain("GEMINI_MODEL   gemini-model");
  expect(output).toContain("COMMIT_PROMPT  Custom prompt configured");
  expect(output).not.toContain("groq-secret-abcd");
  expect(output).not.toContain("tiny");
  expect(output).not.toContain("Write a concise commit message");
});
