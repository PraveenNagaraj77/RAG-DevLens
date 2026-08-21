const gemini = require("../config/gemini");
const env = require("../config/env");

const GENERATION_MODEL = env.gemini.generationModel;

const generateAnswer = async (question, context, history = []) => {
  try {
    const conversationHistory = history.length
      ? history
          .map(
            (message) =>
              `${message.role === "user" ? "User" : "Assistant"}: ${
                message.content
              }`,
          )
          .join("\n")
      : "No previous conversation.";

    const prompt = `
You are DevLens, an AI-powered code and documentation assistant.

Your task is to answer the user's question using the project documentation provided below.

IMPORTANT RULES:
1. Use the Project Documentation Context as the factual source.
2. If the answer is explicitly present or can be directly inferred from the context, answer it.
3. Do not use outside knowledge.
4. Do not invent facts.
5. Conversation history is only for understanding follow-up questions. It is NOT a factual source.
6. Only say "I couldn't find the answer in the provided project documentation." when the documentation genuinely does not contain enough information to answer the question.
7. Give a concise, clear answer.

Previous Conversation:
${conversationHistory}

Project Documentation Context:
${context}

Current User Question:
${question}

Answer:
`;

    console.log("Generating answer with Gemini...");
    console.log("Question:", question);
    console.log("Context length:", context.length);

    console.log("========== CONTEXT ==========");
    console.log(context);
    console.log("========== END CONTEXT ==========");

    const response = await gemini.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
    });

    const answer = response.text?.trim();

    if (!answer) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("Gemini raw response:", response);
    console.log("Gemini response text:", response.text);
    console.log("Gemini answer generated successfully.");

    return answer;
  } catch (error) {
    console.error("LLM generation failed:", error.message);

    throw error;
  }
};

module.exports = {
  GENERATION_MODEL,
  generateAnswer,
};
