const fs = require('fs').promises;
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const isAuthenticated = async () => {
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(oauth2Client.credentials.access_token);
    return tokenInfo && !tokenInfo.expired;
  } catch (error) {
    return false;
  }
};

const refreshToken = async (tokenPath) => {
  try {
    const tokens = JSON.parse(await fs.readFile(tokenPath));
    oauth2Client.setCredentials(tokens);

    if (oauth2Client.isTokenExpiring()) {
      const { tokens: newTokens } = await oauth2Client.refreshToken(tokens.refresh_token);
      oauth2Client.setCredentials(newTokens);
      await fs.writeFile(tokenPath, JSON.stringify(newTokens));
    }
  }
  catch (error) {
    console.error('Error refreshing tokens:', error.message);
  }
};

module.exports = {
  isAuthenticated,
  refreshToken,
  oauth2Client
};