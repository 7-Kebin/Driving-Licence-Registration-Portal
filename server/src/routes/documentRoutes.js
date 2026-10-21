const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authenticate);

// Document download / preview route
router.get('/:id/download', documentController.downloadDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
