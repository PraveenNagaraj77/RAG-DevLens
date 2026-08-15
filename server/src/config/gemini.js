const { GoogleGenAI } = require("@google/genai");
const env = require("./env");

const gemini = new GoogleGenAI({
  apiKey: env.gemini.apiKey,
});

module.exports = gemini;