const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const authClient = require('../constants/authClient');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const calendar = google.calendar({ version: 'v3', auth: authClient });

const isExpiring = (exp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeToExpire = exp - currentTime;
  return timeToExpire < 7200; // 2 hours before it expires
}

const refreshTokens = async (refreshToken) => {
  try {
    const newTokens = await authClient.refreshToken(refreshToken);
    return newTokens.tokens;
  } catch (err) {
    console.error('Error refreshing token:', err);
    throw err;
  }
}

const isAuthenticated = async (req, res, next) => {
  const jwtToken = req.cookies.jwtToken;
  const refreshToken = req.cookies.refreshToken;

  if (!jwtToken) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(jwtToken, secretKey);

    if (isExpiring(decoded.exp)) {
      const decodedRefreshToken = jwt.verify(refreshToken, secretKey);

      if (decodedRefreshToken) {
        const newTokens = await refreshTokens(decodedRefreshToken.refreshToken);
        const newJwtToken = jwt.sign(newTokens, secretKey, { expiresIn: '1d' });
        const newDecoded = jwt.verify(newJwtToken, secretKey);

        authClient.setCredentials(newDecoded);
        res.cookie('jwtToken', newJwtToken, { httpOnly: true, secure: false });
      } else {
        return res.status(401).send('Unauthorized');
      }
    } else {
      authClient.setCredentials(decoded);
    }

    next();
  } catch (error) {
    console.error('Error authenticating:', error);
    return res.status(401).send('Unauthorized');
  }
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
