const openai = require("openai");
const ai = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = ai;
