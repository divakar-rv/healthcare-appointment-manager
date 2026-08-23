const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('doctor'), visitController.submitVisitNotes);
router.get('/:appointment_id', authenticate, visitController.getVisitNote);

module.exports = router;
