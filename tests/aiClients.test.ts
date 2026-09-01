import axios from "axios";
import { generateCompletionWithGroq } from "../src/api/groqClient";
import { generateCompletionWithGemini } from "../src/api/geminiClient";
import { config } from "../src/config";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AI Clients", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("groqClient", () => {
    it("should throw a helpful error when GROQ_APIKEY is missing", async () => {
      jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("");

      await expect(
        generateCompletionWithGroq([{ role: "user", content: "hi" }])
      ).rejects.toThrow("Groq API key is not configured");
    });

    it("should handle 401 unauthorized errors with actionable advice", async () => {
      jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("invalid-key");

      const axiosError = new Error("Request failed with status code 401") as any;
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 401,
        data: { error: { message: "Invalid API Key" } },
      };
      mockedAxios.post.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        generateCompletionWithGroq([{ role: "user", content: "hi" }])
      ).rejects.toThrow("Invalid or expired Groq API key (Invalid API Key)");
    });

    it("should handle 404 model not found errors with model recommendation", async () => {
      jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("valid-key");

      const axiosError = new Error("Request failed with status code 404") as any;
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 404,
        data: { error: { message: "The model does not exist" } },
      };
      mockedAxios.post.mockRejectedValue(axiosError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        generateCompletionWithGroq(
          [{ role: "user", content: "hi" }],
          "old-deprecated-model"
        )
      ).rejects.toThrow(
        "Groq model 'old-deprecated-model' not found or deprecated"
      );
    });

    it("should return content when request succeeds", async () => {
      jest.spyOn(config, "GROQ_APIKEY", "get").mockReturnValue("valid-key");

      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: "feat: add unit tests" } }],
        },
      });

      const res = await generateCompletionWithGroq([
        { role: "user", content: "hi" },
      ]);
      expect(res).toBe("feat: add unit tests");
    });
  });

  describe("geminiClient", () => {
    it("should throw a helpful error when GEMINI_APIKEY is missing", async () => {
      jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("");

      await expect(
        generateCompletionWithGemini([{ role: "user", content: "hi" }])
      ).rejects.toThrow("Gemini API key is not configured");
    });

    it("should return text from candidate parts on success", async () => {
      jest.spyOn(config, "GEMINI_APIKEY", "get").mockReturnValue("valid-key");

      mockedAxios.post.mockResolvedValue({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: "fix: resolve edge case" }],
              },
            },
          ],
        },
      });

      const res = await generateCompletionWithGemini([
        { role: "user", content: "hi" },
      ]);
      expect(res).toBe("fix: resolve edge case");
    });
  });
});


