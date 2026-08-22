const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin-only
router.post('/', authenticate, authorize('admin'), doctorController.createDoctorProfile);
router.put('/:id', authenticate, authorize('admin'), doctorController.updateDoctorProfile);
router.post('/leave', authenticate, authorize('admin'), doctorController.markLeave);

// Public/patient-facing
router.get('/', doctorController.listDoctors);

module.exports = router;