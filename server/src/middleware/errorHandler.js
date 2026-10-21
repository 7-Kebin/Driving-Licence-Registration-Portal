function errorHandler(err, req, res, next) {
  console.error('[Unhandled Error]', err);

  // Multer file upload specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum permitted limit (5MB). Please upload a smaller file.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Handle custom validation or general errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error. Please contact technical support.';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
