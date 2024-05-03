const express = require('express');
const router = express.Router();
const {OAuth2Client} = require('google-auth-library');

async function getUserData(access_token) {
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
  const data = await response.json();
  console.log('data',data);
}

router.get('/request', async function(req, res, next) {
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

router.get('/google/redirect', async function(req, res, next) {
    const code = req.query.code;
    
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


    res.redirect(303, 'http://localhost:8080/dashboard');
});

module.exports = router;

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