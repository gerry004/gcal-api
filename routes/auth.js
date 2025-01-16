const express = require('express');
const router = express.Router();
const authClient = require('../constants/authClient');
const jwt = require('jsonwebtoken');

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
    const { tokens } = await authClient.getToken(code);

    const jwtToken = jwt.sign(tokens, process.env.SECRET_KEY, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ refreshToken: tokens.refresh_token }, process.env.SECRET_KEY, { expiresIn: '14d' })

    res.cookie('jwtToken', jwtToken, { httpOnly: true, secure: false });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false });

    res.redirect('http://localhost:8080/');
  } catch (err) {
    console.error('Error logging in with OAuth2 user', err);
    res.status(500).send('Authentication failed');
  }
});

router.get('/isAuthenticated', function (req, res, next) {
  const jwtToken = req.cookies.jwtToken;

  if (!jwtToken) {
    return res.json({ isAuthenticated: false, message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(jwtToken, process.env.SECRET_KEY);
    res.json({ isAuthenticated: true, message: 'Authenticated', user: decoded });
  } catch (err) {
    console.error('Invalid token', err);
    res.json({ isAuthenticated: false, message: 'Unauthorized: Invalid token' });
  }
});

router.get('/logout', function (req, res, next) {
  res.clearCookie('jwtToken');
  res.clearCookie('refreshToken');

  res.json({ message: 'Successfully logged out' });
});

module.exports = router;
