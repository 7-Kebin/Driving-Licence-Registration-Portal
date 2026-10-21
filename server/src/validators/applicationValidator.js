function validateApplicationInput(req, res, next) {
  const { license_type_id, vehicle_category, application_data } = req.body;
  const errors = {};

  if (!license_type_id) {
    errors.license_type_id = 'Please select a license type.';
  }

  if (!vehicle_category || !vehicle_category.trim()) {
    errors.vehicle_category = 'Please specify the vehicle category.';
  }

  if (!application_data || typeof application_data !== 'object') {
    errors.application_data = 'Application details must be supplied.';
  } else {
    if (!application_data.applicantName || application_data.applicantName.trim().length < 2) {
      errors.applicantName = 'Applicant full name is required.';
    }
    if (!application_data.guardianName || application_data.guardianName.trim().length < 2) {
      errors.guardianName = 'Father / Guardian name is required.';
    }
    if (!application_data.gender) {
      errors.gender = 'Gender selection is required.';
    }
    if (!application_data.bloodGroup) {
      errors.bloodGroup = 'Blood group is required.';
    }
    if (!application_data.testCenter) {
      errors.testCenter = 'Preferred RTO test center is required.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Application form validation failed. Please check the required fields.',
      errors
    });
  }

  next();
}

module.exports = { validateApplicationInput };
