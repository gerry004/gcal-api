const getCalendars = async (calendar, primary = true, calendarNames = []) => {
  try {
    const calendarList = await calendar.calendarList.list();
    const calendars = calendarList.data.items;

    const filteredCalendars = calendars.filter(cal => {
      if (primary && cal.primary) {
        return true; // Include primary calendar
      } else if (calendarNames.length > 0 && calendarNames.includes(cal.summary)) {
        return true; // Include calendars in the calendarNames array
      }
      return false;
    });

    return filteredCalendars;
  } 
  catch (error) {
    console.error('Error fetching calendars:', error.message);
    return [];
  }
};

const getEvents = async (calendars, startDate, endDate) => {
  try {
    const allEvents = [];

    for (const cal of calendars) {
      const events = await cal.events.list({
        calendarId: cal.id,
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });

      if (events.data.items) {
        allEvents.push(...events.data.items);
      }
    }

    return allEvents;
  } 
  catch (error) {
    console.error('Error fetching events:', error.message);
    return [];
  }
};

const sortEventsByColor = (events) => {
  return // array of events sorted by color
}

const calculateTimeSpent = (events) => {
  return // array of events with time spent
}

const convertMillisecondsToHours = (milliseconds) => {
  return // hours
}

const calculateTimeDifferenceInMilliseconds = (startDateTime, endDateTime) => {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);
  const timeDifference = endDate - startDate;
  return timeDifference;
}

module.exports = {
  getCalendars,
  getEvents,
  sortEventsByColor,
  calculateTimeSpent,
  convertMillisecondsToHours,
  calculateTimeDifferenceInMilliseconds,
};