const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage engine with sanitized, unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 10);
    // Sanitize extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeDocType = (req.body.document_type || 'doc').replace(/[^a-z0-9_-]/gi, '');
    const filename = `${safeDocType}_${timestamp}_${randomHex}${ext}`;
    cb(null, filename);
  }
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, and PNG files are accepted for verification.'), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

module.exports = { upload, uploadsDir };
