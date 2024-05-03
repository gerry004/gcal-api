const express = require('express');
const router = express.Router();
const {google} = require('googleapis');
const authClient = require('../constants/authClient');

// const { oauth2Client, refreshToken, isAuthenticated } = require('./authentication.js');
// const { getCalendars, getEvents, sortEventsByColor, calculateTimeSpentByColor, concatenateArrayOfObjects, serialiseObject } = require('./helpers.js');

const calendar = google.calendar({ version: 'v3', auth: authClient });

// const TOKEN_PATH = path.join(__dirname, 'token.json');

const DEFAULT_COLOR_IDS = {
  "gerry04y@gmail.com": 1,
  "Gerry Piano": 2
}

const COLOR_ID_LEGEND = {
  1: "Lavender",
  2: "Sage",
  3: "Grape",
  4: "Flamingo",
  5: "Banana",
  6: "Tangerine",
  7: "Peacock",
  8: "Graphite",
  9: "Blueberry",
  10: "Basil",
  11: "Tomato",
  12: "Mandarin",
}

router.post('/events', async (req, res) => {
  // console.log({req, calendar })
  const response = await calendar.colors.get();
  const colors = response.data.calendar;
  res.json({colors});
});

module.exports = router;

// app.get('/events', async (req, res) => {
//   if (await isAuthenticated()) {
//     await refreshToken(TOKEN_PATH);
//     res.sendFile(path.join(__dirname, 'events.html'));
//   } else {
//     res.redirect('/');
//   }
// });

// app.post('/events', async (req, res) => {
//   try {
//     const { startDate, endDate } = req.body;
//     const calendars = await getCalendars(calendar, ['gerry04y@gmail.com', 'Gerry Piano']);

//     const timeSpentByColors = await Promise.all(calendars.map(async cal => {
//       const events = await getEvents(calendar, cal.id, startDate, endDate);
//       const eventsByColor = sortEventsByColor(events, DEFAULT_COLOR_IDS[cal.summary]);
//       const timeSpentByColor = calculateTimeSpentByColor(eventsByColor);
//       return timeSpentByColor;
//     }));

//     const timeSpentByColor = concatenateArrayOfObjects(timeSpentByColors);
//     const timeSpentByColorWithColorNames = serialiseObject(timeSpentByColor, COLOR_ID_LEGEND);
//     res.json(timeSpentByColorWithColorNames);
//   }
//   catch (error) {
//     console.error('Error fetching events:', error.message);
//     res.status(500).send('Error fetching events');
//   }
// });