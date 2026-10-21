const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { full_name, email, mobile_number, password, date_of_birth, address } = req.body;

    // Check if email already registered
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, mobile_number, password_hash, role, date_of_birth, address, created_at)
       VALUES (?, ?, ?, ?, 'applicant', ?, ?, CURRENT_TIMESTAMP)`,
      [full_name.trim(), email.toLowerCase().trim(), mobile_number.trim(), password_hash, date_of_birth, address.trim()]
    );

    const userId = result.insertId;

    const user = {
      id: userId,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      mobile_number: mobile_number.trim(),
      role: 'applicant',
      date_of_birth,
      address: address.trim()
    };

    const token = generateToken(user);

    await logAudit({
      userId,
      action: 'USER_REGISTERED',
      entityType: 'users',
      entityId: userId,
      details: { email: user.email, role: 'applicant' },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully. Welcome to the Driving License Portal!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, full_name, email, mobile_number, password_hash, role, date_of_birth, address FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please verify credentials.'
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password. Please verify credentials.'
      });
    }

    // Safe user payload (exclude password_hash)
    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile_number: user.mobile_number,
      role: user.role,
      date_of_birth: user.date_of_birth,
      address: user.address
    };

    const token = generateToken(safeUser);

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  if (req.user) {
    await logAudit({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      entityType: 'users',
      entityId: req.user.id,
      details: { email: req.user.email },
      ipAddress: req.ip || req.connection.remoteAddress
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
