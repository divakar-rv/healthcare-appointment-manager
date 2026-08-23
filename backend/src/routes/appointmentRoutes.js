const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/', authenticate, authorize('patient'), appointmentController.bookAppointment);
router.get('/mine', authenticate, appointmentController.getMyAppointments);
router.patch('/:id/cancel', authenticate, appointmentController.cancelAppointment);

module.exports = router;