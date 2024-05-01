require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { oauth2Client, refreshToken, isAuthenticated } = require('./authentication.js');
const { getCalendars, getEvents, sortEventsByColor, calculateTimeSpentByColor, concatenateArrayOfObjects, serialiseObject } = require('./helpers.js');
const dotenv = require('dotenv');
dotenv.config();
const {OAuth2Client} = require('google-auth-library');
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT;
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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

// app.get('/', async (req, res) => {
//   if (await isAuthenticated()) {
//     await refreshToken(TOKEN_PATH);
//     res.redirect('/events');
//   }
//   else {
//     const url = oauth2Client.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES
//     });
//     res.redirect(url);
//   }
// });

app.post('/request', async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", 'http://localhost:8080');
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header("Referrer-Policy","no-referrer-when-downgrade");

  const redirectURL = 'http://localhost:3000/google/redirect';

  const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
      redirectURL
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile  openid https://www.googleapis.com/auth/calendar',
      prompt: 'consent'
    });

    res.json({url:authorizeUrl})

});

async function getUserData(access_token) {

  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  
  //console.log('response',response);
  const data = await response.json();
  console.log('data',data);
}



/* GET home page. */
app.get('/google/redirect', async function(req, res, next) {

    const code = req.query.code;

    console.log(code);
    try {
        const redirectURL = "http://127.0.0.1:3000/google/redirect"
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectURL
          );
        const r =  await oAuth2Client.getToken(code);
        await oAuth2Client.setCredentials(r.tokens);
        console.info('Tokens acquired.');
        const user = oAuth2Client.credentials;
        console.log('credentials',user);
        await getUserData(oAuth2Client.credentials.access_token);

      } catch (err) {
        console.log('Error logging in with OAuth2 user', err);
    }


    res.redirect(303, 'http://localhost:8080/');
  


});

// app.get('/google/redirect', async (req, res) => {
//   try {
//     console.log('Redirecting...');
//     const code = req.query.code;
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);
//     await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
//     res.redirect('/events');
//   }
//   catch (error) {
//     console.error('Error authenticating:', error.message);
//     res.status(500).send('Error authenticating');
//   }
// });

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
      return timeSpentByColor;
    }));

    const timeSpentByColor = concatenateArrayOfObjects(timeSpentByColors);
    const timeSpentByColorWithColorNames = serialiseObject(timeSpentByColor, COLOR_ID_LEGEND);
    res.json(timeSpentByColorWithColorNames);
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
