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
    const { startDate, endDate, calendars } = req.query;

    const startDateTime = startDate + 'T00:00:00Z';
    const endDateTime = endDate + 'T23:59:59Z';

    const eventsPromises = calendars.map(async (cal) => {
      try {
        const response = await calendar.events.list({
          calendarId: cal.id,
          timeMin: startDateTime,
          timeMax: endDateTime,
          singleEvents: true,
          orderBy: 'startTime',
        });
        
        return response.data.items.map((event) => ({
          ...event,
          colorId: event.colorId || cal.defaultEventColor,
        }));
      } catch (error) {
        console.error('Error fetching events for calendar', cal.id, ':', error.message);
        return [];
      }
    });

    const results = await Promise.all(eventsPromises);
    const events = results.flat();
    
    res.json({ events });
  } catch (error) {
    console.error('Error processing events:', error.message);
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
