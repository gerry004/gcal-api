const ai = require("../constants/ai");

const PROMPT = `
  You are a helpful assistant. 
  You will be given a list of events in the following format:

  [
    {summary: 'Personal Finance | Admin', id: '0ui6tq15v6qsk2ussj1jpkdmqd'},
    {summary: 'Watch Squid Game 2', id: '3t9g6t3n6v6q4q9i74qk6b9k6t'},
    {summary: 'Call Diana | Tesco Walk', id: '4t9g6t3n6v6q4q9i74qk6b9k6t'},
    {summary: 'Piano Playing', id: '6t9g6t3n6v6q4q9i74qk6b9k6t'},
    {summary: 'Piano Playing', id: '21r0vv8fp98in6v6q4q9i7mmt'},
  ]

  Personal Finance | Admin is one event. 
  There can be multiple events with the same name, such as Piano Playing, but they will have different ids.
  Your task is to categorise the events and keep track of the events, and their ids in each category.
  Return the result in the following JSON parseable format:

  [
    {
      "category": "Personal",
      "events": [
        { "summary": "Personal Finance | Admin", "id": "0ui6tq15v6qsk2ussj1jpkdmqd" }
      ]
    },
    {
      "category": "Music",
      "events": [
        { "summary": "Piano Playing", "id": "6t9g6t3n6v6q4q9i74qk6b9k6t" },
        { "summary": "Piano Playing", "id": "21r0vv8fp98in6v6q4q9i7mmt" }
      ]
    },
    {
      "category": "Leisure",
      "events": [
        { "summary": "Call Diana | Tesco Walk", "id": "4t9g6t3n6v6q4q9i74qk6b9k6t" },
        { "summary": "Watch Squid Game 2", "id": "3t9g6t3n6v6q4q9i74qk6b9k6t" }
      ]
    }
  ]

  Just return the list of categories and events. Do not include any other text. 
`;

const getSummary = async (events) => {
  try {
    const completion = await ai.chat.completions.create({
      messages: [
        {
          role: "developer",
          content: PROMPT,
        },
        { role: "user", content: JSON.stringify(events) },
      ],
      model: "gpt-4o-mini",
    });
    console.log(completion.choices[0]);

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return [];
  }
};

module.exports = {
  getSummary,
};
