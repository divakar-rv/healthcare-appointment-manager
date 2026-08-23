const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');
const { authenticate } = require('../middleware/auth');

router.get('/connect', authenticate, googleAuthController.connectGoogle);
router.get('/callback', googleAuthController.googleCallback);

module.exports = router;
