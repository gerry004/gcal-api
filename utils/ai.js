const ai = require("../constants/ai");

const getSummary = async (events) => {
  try {
    const completion = await ai.chat.completions.create({
      messages: [
        { role: "developer", content: "You are a helpful assistant. Summarise the list of events, categorise them into different groups." },
        { role: "user", content: events.map((event) => event.summary).join(", ") },
      ],
      model: "gpt-4o-mini",
    });
    console.log(completion.choices[0]);

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return [];
  }
}

module.exports = {
  getSummary,
};