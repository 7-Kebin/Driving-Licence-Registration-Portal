const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateApplicationInput } = require('../validators/applicationValidator');

const documentController = require('../controllers/documentController');
const { upload } = require('../middleware/uploadMiddleware');

// Public route to get available license types
router.get('/license-types', applicationController.getLicenseTypes);

// Public/applicant tracking route
router.get('/track/:applicationNumber', applicationController.trackApplication);

// Protected routes
router.use(authenticate);

router.post('/', validateApplicationInput, applicationController.createApplication);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', applicationController.updateApplication);
router.post('/:id/submit', applicationController.submitApplication);

// Documents under application
router.post('/:id/documents', upload.single('file'), documentController.uploadDocument);
router.get('/:id/documents', documentController.getApplicationDocuments);

module.exports = router;
