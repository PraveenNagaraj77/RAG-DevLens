const gemini = require("../config/gemini");
const env = require("../config/env");

const GENERATION_MODEL = env.gemini.generationModel;

const generateAnswer = async (
  question,
  context,
  history = []
) => {
  try {
    const conversationHistory = history.length
      ? history
          .map(
            (message) =>
              `${message.role === "user" ? "User" : "Assistant"}: ${
                message.content
              }`
          )
          .join("\n")
      : "No previous conversation.";

    const prompt = `
You are DevLens, an AI-powered code and documentation assistant.

Answer the user's question using ONLY the provided project documentation context.

You may use the conversation history to understand references such as:
- "it"
- "that"
- "the above"
- "this"
- follow-up questions

However, conversation history must NOT be treated as factual project documentation.

If the answer cannot be found in the project documentation context, say:
"I couldn't find the answer in the provided project documentation."

Do not make up information.

Previous Conversation:
${conversationHistory}

Project Documentation Context:
${context}

Current User Question:
${question}
`;

    const response = await gemini.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(
      "LLM generation failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  GENERATION_MODEL,
  generateAnswer,
};