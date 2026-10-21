const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// GET /api/applicant/profile
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT id, full_name, email, mobile_number, role, date_of_birth, address, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    res.status(200).json({
      success: true,
      profile: rows[0]
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/applicant/profile
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { full_name, mobile_number, address, current_password, new_password } = req.body;

    const [userRows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let password_hash = userRows[0].password_hash;

    // If changing password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password to update your password.'
        });
      }
      const isMatch = await bcrypt.compare(current_password, userRows[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password provided is incorrect.'
        });
      }
      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters.'
        });
      }
      password_hash = await bcrypt.hash(new_password, 10);
    }

    await db.query(
      `UPDATE users
       SET full_name = COALESCE(?, full_name),
           mobile_number = COALESCE(?, mobile_number),
           address = COALESCE(?, address),
           password_hash = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name || null, mobile_number || null, address || null, password_hash, userId]
    );

    const [updatedRows] = await db.query(
      'SELECT id, full_name, email, mobile_number, role, date_of_birth, address FROM users WHERE id = ?',
      [userId]
    );

    await logAudit({
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'users',
      entityId: userId,
      details: { updatedFields: { full_name, mobile_number, address, passwordChanged: !!new_password } },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully.',
      profile: updatedRows[0]
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applicant/dashboard
async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    // Applications counts
    const [allApps] = await db.query(
      `SELECT a.id, a.application_number, a.status, a.vehicle_category, a.submitted_at, a.created_at,
              lt.name as license_type_name, lt.code as license_type_code
       FROM applications a
       JOIN license_types lt ON a.license_type_id = lt.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    const totalApplications = allApps.length;
    const pendingCount = allApps.filter(a => ['Submitted', 'Pending Review', 'Draft'].includes(a.status)).length;
    const approvedCount = allApps.filter(a => ['Approved', 'Test Scheduled', 'Test Passed', 'License Issued'].includes(a.status)).length;
    const correctionOrRejectedCount = allApps.filter(a => ['Correction Required', 'Rejected', 'Test Failed'].includes(a.status)).length;

    // Recent activity (latest 5 applications)
    const recentActivity = allApps.slice(0, 5);

    // Check for upcoming appointments
    const [appointments] = await db.query(
      `SELECT appt.*, a.application_number, lt.name as license_type_name
       FROM appointments appt
       JOIN applications a ON appt.application_id = a.id
       JOIN license_types lt ON a.license_type_id = lt.id
       WHERE a.user_id = ? AND appt.appointment_status = 'Scheduled'
       ORDER BY appt.appointment_date ASC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalApplications,
          pending: pendingCount,
          approved: approvedCount,
          correctionOrRejected: correctionOrRejectedCount
        },
        recentActivity,
        upcomingAppointments: appointments
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applicant/applications
async function getApplications(req, res, next) {
  try {
    const userId = req.user.id;

    const [applications] = await db.query(
      `SELECT a.*, lt.name as license_type_name, lt.code as license_type_code,
              (SELECT COUNT(*) FROM documents d WHERE d.application_id = a.id) as documents_count,
              (SELECT COUNT(*) FROM documents d WHERE d.application_id = a.id AND d.verification_status = 'Verified') as verified_documents_count,
              appt.appointment_date, appt.appointment_time, appt.test_center, appt.test_result, appt.appointment_status
       FROM applications a
       JOIN license_types lt ON a.license_type_id = lt.id
       LEFT JOIN appointments appt ON appt.application_id = a.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      applications
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getApplications
};
