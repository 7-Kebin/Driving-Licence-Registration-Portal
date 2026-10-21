const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/profile', applicantController.getProfile);
router.put('/profile', applicantController.updateProfile);
router.get('/dashboard', applicantController.getDashboard);
router.get('/applications', applicantController.getApplications);

module.exports = router;
