import { generateCompletion } from "../src/api/aiClient";
import { generateCompletionWithGroq } from "../src/api/groqClient";
import { generateCompletionWithGemini } from "../src/api/geminiClient";
import { config } from "../src/config";

jest.mock("../src/api/groqClient", () => ({
  generateCompletionWithGroq: jest.fn(),
}));
jest.mock("../src/api/geminiClient", () => ({
  generateCompletionWithGemini: jest.fn(),
}));

const mockedGroq = generateCompletionWithGroq as jest.Mock;
const mockedGemini = generateCompletionWithGemini as jest.Mock;

describe("generateCompletion (Groq -> Gemini fallback)", () => {
  const messages = [{ role: "user" as const, content: "hi" }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses Groq directly when it succeeds", async () => {
    jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("groq-key");
    jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("gemini-key");
    mockedGroq.mockResolvedValue("groq result");

    const result = await generateCompletion(messages);

    expect(result).toBe("groq result");
    expect(mockedGroq).toHaveBeenCalledWith(messages, undefined);
    expect(mockedGemini).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when Groq fails, propagating the model param", async () => {
    jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("groq-key");
    jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("gemini-key");
    mockedGroq.mockRejectedValue(new Error("Groq rate limit exceeded"));
    mockedGemini.mockResolvedValue("gemini result");

    const result = await generateCompletion(messages, "custom-model");

    expect(result).toBe("gemini result");
    expect(mockedGroq).toHaveBeenCalledWith(messages, "custom-model");
    // Regression check: the model override must not be dropped on the fallback path.
    expect(mockedGemini).toHaveBeenCalledWith(messages, "custom-model");
  });

  it("throws a combined error when both Groq and Gemini fail", async () => {
    jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("groq-key");
    jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("gemini-key");
    mockedGroq.mockRejectedValue(new Error("groq down"));
    mockedGemini.mockRejectedValue(new Error("gemini down"));

    await expect(generateCompletion(messages)).rejects.toThrow(
      /Both Groq and Gemini APIs failed/
    );
  });

  it("goes straight to Gemini when no Groq key is configured", async () => {
    jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("");
    jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("gemini-key");
    mockedGemini.mockResolvedValue("gemini result");

    const result = await generateCompletion(messages, "custom-model");

    expect(result).toBe("gemini result");
    expect(mockedGroq).not.toHaveBeenCalled();
    expect(mockedGemini).toHaveBeenCalledWith(messages, "custom-model");
  });

  it("throws when no API keys are configured at all", async () => {
    jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("");
    jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("");

    await expect(generateCompletion(messages)).rejects.toThrow(
      "No API keys configured"
    );
  });
});
