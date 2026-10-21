const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { uploadsDir } = require('../middleware/uploadMiddleware');

// POST /api/applications/:id/documents
async function uploadDocument(req, res, next) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const { document_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a valid document file.' });
    }

    const validTypes = ['identity_proof', 'address_proof', 'age_proof', 'photograph', 'signature'];
    if (!validTypes.includes(document_type)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed types: ${validTypes.join(', ')}`
      });
    }

    // Verify application existence and permission
    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];
    if (req.user.role !== 'admin' && application.user_id !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Check if edits allowed
    if (req.user.role !== 'admin' && !['Draft', 'Correction Required'].includes(application.status)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Document uploads are not permitted while application is in '${application.status}' status.`
      });
    }

    const relativePath = path.relative(path.resolve(__dirname, '../../'), req.file.path).replace(/\\/g, '/');

    // Check if a document of this type already exists for this application
    const [existing] = await db.query(
      'SELECT id, file_path FROM documents WHERE application_id = ? AND document_type = ?',
      [applicationId, document_type]
    );

    let docId;
    if (existing.length > 0) {
      // Update existing document record
      docId = existing[0].id;
      // Optionally remove old file if exists
      const oldPath = path.resolve(__dirname, '../../', existing[0].file_path);
      if (fs.existsSync(oldPath) && !oldPath.includes('sample_')) {
        try { fs.unlinkSync(oldPath); } catch (_) {}
      }

      await db.query(
        `UPDATE documents
         SET file_path = ?, original_filename = ?, file_size = ?, mime_type = ?,
             verification_status = 'Pending', verification_remarks = NULL, uploaded_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [relativePath, req.file.originalname, req.file.size, req.file.mimetype, docId]
      );
    } else {
      // Insert new document record
      const [insertResult] = await db.query(
        `INSERT INTO documents (application_id, document_type, file_path, original_filename, file_size, mime_type, verification_status, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)`,
        [applicationId, document_type, relativePath, req.file.originalname, req.file.size, req.file.mimetype]
      );
      docId = insertResult.insertId;
    }

    await logAudit({
      userId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'documents',
      entityId: docId,
      details: { applicationId, document_type, originalFilename: req.file.originalname, fileSize: req.file.size },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: `${document_type.replace('_', ' ').toUpperCase()} uploaded successfully.`,
      document: {
        id: docId,
        application_id: applicationId,
        document_type,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        verification_status: 'Pending'
      }
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    next(err);
  }
}

// GET /api/applications/:id/documents
async function getApplicationDocuments(req, res, next) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const [apps] = await db.query('SELECT user_id FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user.role !== 'admin' && apps[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [documents] = await db.query(
      'SELECT id, application_id, document_type, original_filename, file_size, mime_type, verification_status, verification_remarks, uploaded_at, verified_at FROM documents WHERE application_id = ? ORDER BY id ASC',
      [applicationId]
    );

    res.status(200).json({
      success: true,
      documents
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/documents/:id/download
async function downloadDocument(req, res, next) {
  try {
    const documentId = req.params.id;
    const [docs] = await db.query(
      `SELECT d.*, a.user_id
       FROM documents d
       JOIN applications a ON d.application_id = a.id
       WHERE d.id = ?`,
      [documentId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const doc = docs[0];

    // Authorization check
    if (req.user.role !== 'admin' && doc.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized document access.' });
    }

    const absolutePath = path.resolve(__dirname, '../../', doc.file_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical document file not found on server storage.'
      });
    }

    // Set headers
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename}"`);
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/documents/:id
async function deleteDocument(req, res, next) {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    const [docs] = await db.query(
      `SELECT d.*, a.user_id, a.status as application_status
       FROM documents d
       JOIN applications a ON d.application_id = a.id
       WHERE d.id = ?`,
      [documentId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const doc = docs[0];

    if (req.user.role !== 'admin' && doc.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (req.user.role !== 'admin' && !['Draft', 'Correction Required'].includes(doc.application_status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete document for an application currently under review or completed.'
      });
    }

    // Remove file
    const absolutePath = path.resolve(__dirname, '../../', doc.file_path);
    if (fs.existsSync(absolutePath) && !absolutePath.includes('sample_')) {
      try { fs.unlinkSync(absolutePath); } catch (_) {}
    }

    await db.query('DELETE FROM documents WHERE id = ?', [documentId]);

    await logAudit({
      userId,
      action: 'DOCUMENT_DELETED',
      entityType: 'documents',
      entityId: documentId,
      details: { document_type: doc.document_type, original_filename: doc.original_filename },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
  deleteDocument
};
