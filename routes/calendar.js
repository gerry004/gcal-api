const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const authClient = require('../constants/authClient');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const calendar = google.calendar({ version: 'v3', auth: authClient });

const isAuthenticated = (req, res, next) => {
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

router.get('/colors', isAuthenticated, async (req, res) => {
  try {
    const response = await calendar.colors.get();
    const eventColors = response.data.event;
    res.json({ colors: eventColors });
  } catch (error) {
    res.status(500).send('Error fetching calendar list');
  }
});

router.get("/events", isAuthenticated, async (req, res) => {
  try {
    const startDate = req.query.startDate + 'T00:00:00Z';
    const endDate = req.query.endDate + 'T00:00:00Z';
    const calendars = req.query.calendars;
    const colors = req.query.colors;

    const eventsPromises = calendars.map((cal) =>
      calendar.events.list({
        calendarId: cal.id,
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      })
    );

    const results = await Promise.all(eventsPromises);
    const events = results.flatMap((result) => result.data.items);

    const filteredEvents = events.filter(
      (event) => Object.keys(colors).includes(event.colorId)
    );

    res.json({ events: filteredEvents });
  
  } catch (error) {
    console.log('Error fetching events:', error.message)
    res.status(500).send('Error fetching events');
  }
});

router.get('/calendars', isAuthenticated, async (req, res) => {
  try {
    const response = await calendar.calendarList.list();
    res.json({ calendars: response.data.items });
  } catch (error) {
    res.status(500).send('Error fetching calendar list');
  }
});

module.exports = router;
