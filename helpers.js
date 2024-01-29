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
    const minutes = millisecondsToMinutes(timeSpentInMilliseconds);
    timeSpentByColor[color] = minutes;
  });
  return timeSpentByColor;
}

const millisecondsToMinutes = (milliseconds) => {
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    throw new Error('Input must be a positive number representing milliseconds.');
  }
  const minutes = milliseconds / (1000 * 60);
  return minutes;
}

const minutesToHoursAndMinutes = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) {
    throw new Error('Input must be a positive number representing minutes.');
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return { hours, minutes: remainingMinutes };
}

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
  const concatenatedObject = {};
  arrayOfObjects.forEach(obj => {
    Object.keys(obj).forEach(key => {
      if (!concatenatedObject[key]) {
        concatenatedObject[key] = 0;
      }
      if (typeof obj[key] === 'number') {
        concatenatedObject[key] += obj[key];
      }
    });
  });
  return concatenatedObject;
}

const serialiseObject = (obj, legend) => {
  const serialisedObject = {};
  Object.keys(obj).forEach(key => {
    serialisedObject[legend[key]] = minutesToHoursAndMinutes(obj[key]);
  });
  return serialisedObject;
}

module.exports = {
  getCalendars,
  getEvents,
  sortEventsByColor,
  calculateTimeSpentByColor,
  concatenateArrayOfObjects,
  serialiseObject,
  minutesToHoursAndMinutes,
};