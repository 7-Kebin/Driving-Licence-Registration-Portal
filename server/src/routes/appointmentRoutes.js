const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/authMiddleware');

// Get available slots can be queried by authenticated applicant
router.get('/available-slots', authenticate, appointmentController.getAvailableSlots);
router.post('/', authenticate, appointmentController.bookAppointment);
router.get('/my-appointments', authenticate, appointmentController.getMyAppointments);

module.exports = router;
