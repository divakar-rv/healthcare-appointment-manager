const { google } = require('googleapis');

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Generates the URL the user visits to grant calendar access.
// `state` carries the user's id through the redirect so we know whose tokens these are.
function getAuthUrl(userId) {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: String(userId)
  });
}

async function getTokensFromCode(code) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens; // { access_token, refresh_token, expiry_date, ... }
}

// Returns an authenticated client for a specific user, refreshing the token if needed.
async function getAuthenticatedClient(user) {
  if (!user.google_refresh_token) {
    throw new Error('User has not connected Google Calendar');
  }
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : null
  });
  return oauth2Client;
}

module.exports = { getAuthUrl, getTokensFromCode, getAuthenticatedClient };
