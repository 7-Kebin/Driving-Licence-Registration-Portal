function validateRegister(req, res, next) {
  const { full_name, email, mobile_number, password, confirm_password, date_of_birth, address, terms_accepted } = req.body;
  const errors = {};

  if (!full_name || full_name.trim().length < 3) {
    errors.full_name = 'Full name must be at least 3 characters long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid official email address.';
  }

  const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
  if (!mobile_number || !phoneRegex.test(mobile_number.trim())) {
    errors.mobile_number = 'Please enter a valid 10-digit mobile number.';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long and contain letters and numbers.';
  }

  if (confirm_password && password !== confirm_password) {
    errors.confirm_password = 'Password confirmation does not match.';
  }

  if (!date_of_birth) {
    errors.date_of_birth = 'Date of birth is required.';
  } else {
    const dob = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 16) {
      errors.date_of_birth = 'Applicant must be at least 16 years of age to register.';
    }
  }

  if (!address || address.trim().length < 10) {
    errors.address = 'Please provide complete residential address (min 10 characters).';
  }

  if (terms_accepted !== true && terms_accepted !== 'true' && terms_accepted !== 1) {
    errors.terms_accepted = 'You must accept the terms and conditions to proceed.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address or username is required.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      errors
    });
  }

  next();
}

module.exports = { validateRegister, validateLogin };
