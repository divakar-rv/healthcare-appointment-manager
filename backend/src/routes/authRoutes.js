const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
const { authenticate, authorize } = require('../middleware/auth');

router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});
module.exports = router;