const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const port = 3000;

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
app.use(express.static(path.join(__dirname)));

const { oauth2Client, refreshToken, isAuthenticated } = require('./authentication.js');
const { getCalendars, getEvents, sortEventsByColor, calculateTimeSpentByColor, concatenateArrayOfObjects } = require('./helpers.js');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const DEFAULT_COLOR_IDS = {
  "gerry04y@gmail.com": 1,
  "Gerry Piano": 2
}

const COLOR_ID_LEGEND = {
  1: "Lavendar",
  2: "Sage",
  3: "Grape",
  5: "Banana",
  9: "Blueberry",
  11: "Tomato"
}

app.get('/', async (req, res) => {
  if (await isAuthenticated()) {
    await refreshToken(TOKEN_PATH);
    res.redirect('/events');
  }
  else {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    res.redirect(url);
  }
});

app.get('/google/redirect', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    res.redirect('/events');
  }
  catch (error) {
    console.error('Error authenticating:', error.message);
    res.status(500).send('Error authenticating');
  }
});

app.get('/events', async (req, res) => {
  if (await isAuthenticated()) {
    await refreshToken(TOKEN_PATH);
    res.sendFile(path.join(__dirname, 'events.html'));
  } else {
    res.redirect('/');
  }
});

app.post('/events', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const calendars = await getCalendars(calendar, ['gerry04y@gmail.com', 'Gerry Piano']);

    const timeSpentByColors = await Promise.all(calendars.map(async cal => {
      const events = await getEvents(calendar, cal.id, startDate, endDate);
      const eventsByColor = sortEventsByColor(events, DEFAULT_COLOR_IDS[cal.summary]);
      const timeSpentByColor = calculateTimeSpentByColor(eventsByColor);
      console.log(timeSpentByColor);
      return timeSpentByColor;
    }));
    const timeSpentByColor = concatenateArrayOfObjects(timeSpentByColors);
    res.json(timeSpentByColor);
  }
  catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Error fetching events');
  }
});

app.listen(port, () => {
  try {
    console.log(`Starting Express Server...`);
    console.log(`Listening on Port:${port}`);
  }
  catch (error) {
    console.error('Error starting server:', error.message);
  }
});
