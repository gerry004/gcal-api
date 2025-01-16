const ICAL = require("ical.js");
const fetch = require("node-fetch");

async function getEventsBetweenDates(icsUrl, startDate, endDate) {
  try {
    // Parse the ICS data from the public URL
    const response = await fetch(icsUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch ICS file: ${response.statusText}`);
    const icsData = await response.text();

    // Use ical.js library to parse the data
    const ical = ICAL.parse(icsData);
    const comp = new ICAL.Component(ical);
    const events = comp.getAllSubcomponents("vevent");

    // Convert the input dates to JS Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter and return events within the specified date range
    const filteredEvents = events
      .map((event) => {
        const vevent = new ICAL.Event(event);
        const startDate = vevent.startDate ? vevent.startDate.toJSDate() : null;
        const endDate = vevent.endDate ? vevent.endDate.toJSDate() : null;

        return {
          summary: vevent.summary,
          description: vevent.description,
          start: startDate,
          end: endDate,
        };
      })
      .filter((event) => {
        return (
          event.start && event.end && event.start >= start && event.end <= end
        );
      });

    return filteredEvents;
  } catch (error) {
    console.error("Error fetching or parsing ICS data:", error);
    return [];
  }
}

// Usage example:
(async () => {
  // const icsUrl =
  //   "https://calendar.google.com/calendar/ical/gerry04y%40gmail.com/public/basic.ics";
  const icsUrl = "https://calendar.google.com/calendar/ical/gerry04y%40gmail.com/private-b188fa76df5abfaed404e9e466c0c914/basic.ics";
  const startDate = "2025-01-01"; // Format: YYYY-MM-DD
  const endDate = "2025-01-31"; // Format: YYYY-MM-DD

  const events = await getEventsBetweenDates(icsUrl, startDate, endDate);
  console.log("Filtered Events:", events);
})();
