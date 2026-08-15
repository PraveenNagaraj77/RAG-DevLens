const gemini = require("../config/gemini");

const {
  GENERATION_MODEL,
  generateAnswer,
} = require("../services/llmService");

jest.mock("../config/gemini", () => ({
  models: {
    generateContent: jest.fn(),
  },
}));

describe("LLM Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAnswer", () => {
    test("should generate an answer successfully", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "React is a JavaScript library for building user interfaces.",
      });

      const result = await generateAnswer(
        "What is React?",
        "React is a JavaScript library for building user interfaces."
      );

      expect(result).toBe(
        "React is a JavaScript library for building user interfaces."
      );

      expect(
        gemini.models.generateContent
      ).toHaveBeenCalledTimes(1);

      expect(
        gemini.models.generateContent
      ).toHaveBeenCalledWith({
        model: GENERATION_MODEL,
        contents: expect.any(String),
      });
    });

    test("should include the question in the prompt", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "React is used for building UIs.",
      });

      await generateAnswer(
        "What is React?",
        "React documentation content."
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "What is React?"
      );
    });

    test("should include project documentation context in the prompt", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "The project uses React.",
      });

      await generateAnswer(
        "What frontend technology is used?",
        "The project uses React for the frontend."
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "The project uses React for the frontend."
      );
    });

    test("should include conversation history in the prompt", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "Yes, it uses React.",
      });

      const history = [
        {
          role: "user",
          content: "Does the project use React?",
        },
        {
          role: "assistant",
          content: "Yes, it does.",
        },
      ];

      await generateAnswer(
        "What about the frontend?",
        "The frontend uses React.",
        history
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "User: Does the project use React?"
      );

      expect(call.contents).toContain(
        "Assistant: Yes, it does."
      );
    });

    test("should handle empty conversation history", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "The answer is available in the documentation.",
      });

      await generateAnswer(
        "What is DevLens?",
        "DevLens is an AI code assistant.",
        []
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "No previous conversation."
      );
    });

    test("should correctly format user and assistant history", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "The project uses React.",
      });

      const history = [
        {
          role: "user",
          content: "What frontend framework is used?",
        },
        {
          role: "assistant",
          content: "React is used.",
        },
        {
          role: "user",
          content: "Why is it used?",
        },
      ];

      await generateAnswer(
        "Explain further.",
        "React documentation.",
        history
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "User: What frontend framework is used?"
      );

      expect(call.contents).toContain(
        "Assistant: React is used."
      );

      expect(call.contents).toContain(
        "User: Why is it used?"
      );
    });

    test("should include the instruction to use only project documentation", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "Answer.",
      });

      await generateAnswer(
        "What is the project?",
        "Project documentation."
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "using ONLY the provided project documentation context"
      );
    });

    test("should include the no-answer instruction", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "I couldn't find the answer in the provided project documentation.",
      });

      await generateAnswer(
        "Unknown question",
        "Limited documentation."
      );

      const call =
        gemini.models.generateContent.mock.calls[0][0];

      expect(call.contents).toContain(
        "I couldn't find the answer in the provided project documentation."
      );
    });

    test("should use the configured generation model", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "Generated answer.",
      });

      await generateAnswer(
        "Test question",
        "Test context"
      );

      expect(
        gemini.models.generateContent
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          model: GENERATION_MODEL,
        })
      );
    });

    test("should return Gemini response text", async () => {
      gemini.models.generateContent.mockResolvedValueOnce({
        text: "Generated response from Gemini.",
      });

      const result = await generateAnswer(
        "Test question",
        "Test context"
      );

      expect(result).toBe(
        "Generated response from Gemini."
      );
    });

    test("should propagate Gemini generation errors", async () => {
      gemini.models.generateContent.mockRejectedValueOnce(
        new Error("Gemini generation failed")
      );

      await expect(
        generateAnswer(
          "Test question",
          "Test context"
        )
      ).rejects.toThrow(
        "Gemini generation failed"
      );

      expect(
        gemini.models.generateContent
      ).toHaveBeenCalledTimes(1);
    });
  });
});