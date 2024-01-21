const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const port = 3000;

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const { getCalendars, getEvents, sortEventsByColor, calculateTimeSpentByColor } = require('./helpers.js');
const { time } = require('console');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const oauth2Client = new google.auth.OAuth2(
  '95600525412-4qa3sr7ukqbssqpala8s1v1qsjrbjn5f.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/google/redirect'
);
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const checkAuthenticationMiddleware = async (req, res, next) => {
  try {
    const tokens = JSON.parse(await fs.readFile(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);

    if (oauth2Client.isTokenExpiring()) {
      const { tokens: newTokens } = await oauth2Client.refreshToken(tokens.refresh_token);
      oauth2Client.setCredentials(newTokens);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(newTokens));
    }
    req.oauth2Client = oauth2Client;
    next();
  }
  catch (error) {
    console.error('Error fetching tokens:', error.message);
    res.status(500).send('Error fetching tokens');
  }
};

app.use(checkAuthenticationMiddleware);

// the page where the user signs in, redirects to /google/redirect
app.get('/', async (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  res.redirect(url);
});

// gets authentication token and writes it to a json file
app.get('/google/redirect', async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await req.oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    res.send("Authentication successful. You can now use the /events endpoint to get a list of events.");
  }
  catch (error) {
    console.error('Error authenticating:', error.message);
    res.status(500).send('Error authenticating');
  }
});

const DEFAULT_COLOR_IDS = {
  "gerry04y@gmail.com": 1,
  "Gerry Piano": 2
}

app.get('/events', async (req, res) => {
  try {
    const startDate = '2023-01-23T00:00:00Z'; // Replace with your start date
    const endDate = '2023-01-23T23:59:59Z'; // Replace with your end date
    const calendars = await getCalendars(calendar, ['gerry04y@gmail.com', 'Gerry Piano']);
    calendars.forEach(async cal => {
      console.log("foreach", cal.summary);
      const events = await getEvents(calendar, cal.summary, startDate, endDate);
      const eventsByColor = sortEventsByColor(events, DEFAULT_COLOR_IDS[cal.summary]);
      const timeSpentByColor = calculateTimeSpentByColor(eventsByColor);
      console.log(cal.summary);
      console.log(timeSpentByColor);
    });

    res.json(calendars);
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
