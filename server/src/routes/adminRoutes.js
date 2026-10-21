const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All admin routes strictly require valid admin authentication
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/applications', adminController.getAdminApplications);
router.get('/applications/:id', adminController.getAdminApplicationDetails);
router.patch('/applications/:id/status', adminController.updateApplicationStatus);
router.post('/applications/:id/issue-license', adminController.issueLicense);

router.patch('/documents/:id/verification', adminController.verifyDocument);

router.post('/appointments', adminController.adminScheduleAppointment);
router.patch('/appointments/:id/result', adminController.recordTestResult);

router.get('/reports', adminController.getAdminReports);
router.get('/applicants', adminController.getAdminApplicants);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
