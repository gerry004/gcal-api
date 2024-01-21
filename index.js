const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const app = express();
app.use(bodyParser.json());
const port = 3000;

const TOKEN_PATH = path.join(__dirname, 'token.json');

const oauth2Client = new google.auth.OAuth2(
  '95600525412-4qa3sr7ukqbssqpala8s1v1qsjrbjn5f.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/google/redirect'
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

app.get('/', async (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
  res.redirect(url);
});

app.get('/google/redirect', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save the tokens to a file
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  
  res.send("Authentication successful. You can now use the /events endpoint to get a list of events.");
});

app.get('/events', async (req, res) => {
  try {
    // Check if tokens are stored
    let tokens;
    try {
      tokens = JSON.parse(await fs.readFile(TOKEN_PATH));
    } catch (error) {
      console.error('Error reading tokens:', error.message);
      return res.status(401).send('Authentication required. Please sign in.');
    }

    oauth2Client.setCredentials(tokens);

    // Check if the token is expired
    if (oauth2Client.isTokenExpiring()) {
      const { tokens: newTokens } = await oauth2Client.refreshToken(tokens.refresh_token);
      oauth2Client.setCredentials(newTokens);

      // Save the new tokens to a file
      await fs.writeFile(TOKEN_PATH, JSON.stringify(newTokens));
    }

    const calendarId = 'primary';
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    console.log('Events:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Error fetching events');
  }
});

app.listen(port, () => {
  console.log(`Starting Express Server...`);
  console.log(`Listening on Port:${port}`);
});
