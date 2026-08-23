const { User } = require('../../models');
const { getAuthUrl, getTokensFromCode } = require('../services/googleAuth');

exports.connectGoogle = async (req, res) => {
  try {
    const url = getAuthUrl(req.user.id);
    res.json({ auth_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }
    const tokens = await getTokensFromCode(code);
    const userId = parseInt(state, 10);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    await user.update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token || user.google_refresh_token,
      google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    });

    res.send('Google Calendar connected successfully. You can close this tab.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to connect Google Calendar');
  }
};
