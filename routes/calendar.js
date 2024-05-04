const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const authClient = require('../constants/authClient');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const calendar = google.calendar({ version: 'v3', auth: authClient });

function jwtAuthMiddleware(req, res, next) {
  const jwtToken = req.cookies.jwtToken;
  if (!jwtToken) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(jwtToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    authClient.setCredentials(decoded);
    next();
  });
}

router.get('/colors', jwtAuthMiddleware, async (req, res) => {
  try {
    const response = await calendar.colors.get();
    const eventColors = response.data.event;
    res.json({ colors: eventColors });
  } catch (error) {
    res.status(500).send('Error fetching calendar list');
  }
});

router.get("/events", jwtAuthMiddleware, async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 2,
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = response.data.items || [];
    console.log(events);
    res.json({ events })
  
  } catch (error) {
    console.log('Error fetching events:', error.message)
    res.status(500).send('Error fetching events');
  }
});

router.get('/calendars', jwtAuthMiddleware, async (req, res) => {
  try {
    const response = await calendar.calendarList.list();
    res.json({ calendars: response.data.items });
  } catch (error) {
    res.status(500).send('Error fetching calendar list');
  }
});

module.exports = router;

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