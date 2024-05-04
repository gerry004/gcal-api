const express = require('express');
const router = express.Router();
const {google} = require('googleapis');
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

router.post('/events', jwtAuthMiddleware, async (req, res) => {
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