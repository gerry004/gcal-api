const express = require('express');
const router = express.Router();
const authClient = require('../constants/authClient');

async function getUserData(access_token) {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  const data = await response.json();
  console.log('data', data);
}

router.get('/request', async function (req, res, next) {
  const authUrl = authClient.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile  openid https://www.googleapis.com/auth/calendar',
    prompt: 'consent'
  });

  res.json({ url: authUrl })
});

router.get('/google/redirect', async function (req, res, next) {
  const code = req.query.code;

  try {
    const r = await authClient.getToken(code);
    await authClient.setCredentials(r.tokens);
    console.info('Tokens acquired.');
    const user = authClient.credentials;
    console.log('credentials', user);
    await getUserData(authClient.credentials.access_token);

  } catch (err) {
    console.log('Error logging in with OAuth2 user', err);
  }


  res.redirect(303, 'http://localhost:8080/dashboard');
});

module.exports = router;

// app.get('/google/redirect', async (req, res) => {
//   try {
//     console.log('Redirecting...');
//     const code = req.query.code;
//     const { tokens } = await authClient.getToken(code);
//     authClient.setCredentials(tokens);
//     await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
//     res.redirect('/events');
//   }
//   catch (error) {
//     console.error('Error authenticating:', error.message);
//     res.status(500).send('Error authenticating');
//   }
// });

// app.get('/', async (req, res) => {
//   if (await isAuthenticated()) {
//     await refreshToken(TOKEN_PATH);
//     res.redirect('/events');
//   }
//   else {
//     const url = authClient.generateAuthUrl({
//       access_type: 'offline',
//       scope: SCOPES
//     });
//     res.redirect(url);
//   }
// });