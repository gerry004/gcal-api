const getCalendars = async (calendar, calendarNames = []) => {
  try {
    const { data: { items: calendars } } = await calendar.calendarList.list();

    const filteredCalendars = calendars.filter(cal => {
      return (calendarNames.length > 0 && calendarNames.includes(cal.summary));
    });

    return filteredCalendars;
  } catch (error) {
    console.error('Error fetching calendars:', error.message);
    return [];
  }
};

const getEvents = async (calendar, calendarId, startDate, endDate) => {
  try {
    const events = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return events.data.items;
  } catch (error) {
    console.error('Error fetching events:', error.message);
    return [];
  }
};

const sortEventsByColor = (events, defaultColorId) => {
  const sortedEvents = {};
  events.forEach(event => {
    const color = event.colorId || defaultColorId;
    sortedEvents[color] = sortedEvents[color] || [];
    sortedEvents[color].push(event);
  });
  return sortedEvents;
};

const calculateTimeSpentByColor = (eventsByColor) => {
  const timeSpentByColor = {};
  Object.keys(eventsByColor).forEach(color => {
    let timeSpentInMilliseconds = 0;
    eventsByColor[color].forEach(event => {
      const startDateTime = event.start.dateTime;
      const endDateTime = event.end.dateTime;
      const timeDifference = calculateTimeDifferenceInMilliseconds(startDateTime, endDateTime);
      timeSpentInMilliseconds += timeDifference;
    });
    const { hours, minutes } = convertMillisecondsToHoursAndMinutes(timeSpentInMilliseconds);
    timeSpentByColor[color] = { hours, minutes };
  });
  return timeSpentByColor;
}

const convertMillisecondsToHoursAndMinutes = (milliseconds) => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

const calculateTimeDifferenceInMilliseconds = (startDateTime, endDateTime) => {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);
  const timeDifference = endDate - startDate;
  if (isNaN(timeDifference)) {
    return 0;
  }
  return timeDifference;
}

const concatenateArrayOfObjects = (arrayOfObjects) => {
  const concatendatedObject = {};
  arrayOfObjects.forEach(obj => {
    Object.keys(obj).forEach(key => {
      concatendatedObject[key] = concatendatedObject[key] || {};
      concatendatedObject[key] = { ...concatendatedObject[key], ...obj[key] };
    });
  });
  return concatendatedObject;
}

module.exports = {
  getCalendars,
  getEvents,
  sortEventsByColor,
  calculateTimeSpentByColor,
  concatenateArrayOfObjects,
};