const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, symptomController.submitSymptoms);
router.get('/:appointment_id', authenticate, symptomController.getSymptomForm);

module.exports = router;
