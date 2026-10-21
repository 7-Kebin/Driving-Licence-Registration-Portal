const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { generateLicenseNumber } = require('../utils/licenseGenerator');

// Valid status transitions state machine
const ALLOWED_TRANSITIONS = {
  'Draft': ['Submitted'],
  'Submitted': ['Pending Review', 'Approved', 'Correction Required', 'Rejected'],
  'Pending Review': ['Approved', 'Correction Required', 'Rejected'],
  'Correction Required': ['Pending Review', 'Submitted', 'Rejected'],
  'Approved': ['Test Scheduled', 'License Issued', 'Rejected'], // Direct issue allowed for LL or exempt
  'Test Scheduled': ['Test Passed', 'Test Failed', 'Test Scheduled'],
  'Test Passed': ['License Issued'],
  'Test Failed': ['Test Scheduled', 'Rejected'],
  'License Issued': [],
  'Rejected': []
};

// GET /api/admin/dashboard
async function getAdminDashboard(req, res, next) {
  try {
    // 1. Total applicants
    const [applicantCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'applicant'");

    // 2. Total applications & status counts
    const [apps] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);

    const statusCounts = {
      Draft: 0,
      Submitted: 0,
      'Pending Review': 0,
      'Correction Required': 0,
      Approved: 0,
      'Test Scheduled': 0,
      'Test Passed': 0,
      'Test Failed': 0,
      'License Issued': 0,
      Rejected: 0
    };

    let totalApplications = 0;
    apps.forEach(row => {
      statusCounts[row.status] = row.count;
      totalApplications += row.count;
    });

    // 3. Applications grouped by license type
    const [byLicenseType] = await db.query(`
      SELECT lt.name, lt.code, COUNT(a.id) as count
      FROM license_types lt
      LEFT JOIN applications a ON lt.id = a.license_type_id
      GROUP BY lt.id, lt.name, lt.code
    `);

    // 4. Recent submissions (latest 5)
    const [recentSubmissions] = await db.query(`
      SELECT a.id, a.application_number, a.status, a.vehicle_category, a.submitted_at, a.created_at,
             u.full_name as applicant_name, u.email as applicant_email,
             lt.name as license_type_name
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN license_types lt ON a.license_type_id = lt.id
      ORDER BY a.created_at DESC
      LIMIT 6
    `);

    // 5. Recent audit activity
    const [recentAudits] = await db.query(`
      SELECT al.*, u.full_name as user_name, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 6
    `);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalApplicants: applicantCount[0].count,
          totalApplications,
          pendingReview: (statusCounts['Submitted'] || 0) + (statusCounts['Pending Review'] || 0),
          approved: statusCounts['Approved'] || 0,
          correctionRequired: statusCounts['Correction Required'] || 0,
          testScheduled: statusCounts['Test Scheduled'] || 0,
          licenseIssued: statusCounts['License Issued'] || 0,
          rejected: statusCounts['Rejected'] || 0,
          byStatus: statusCounts
        },
        byLicenseType,
        recentSubmissions,
        recentAudits
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/applications
async function getAdminApplications(req, res, next) {
  try {
    const { search, status, license_type_id, page = 1, limit = 10, sort_by = 'created_at', sort_dir = 'DESC' } = req.query;

    let whereClauses = [];
    let queryParams = [];

    if (search && search.trim()) {
      whereClauses.push(`(
        a.application_number LIKE ? OR
        u.full_name LIKE ? OR
        u.email LIKE ? OR
        u.mobile_number LIKE ?
      )`);
      const s = `%${search.trim()}%`;
      queryParams.push(s, s, s, s);
    }

    if (status && status.trim()) {
      whereClauses.push('a.status = ?');
      queryParams.push(status.trim());
    }

    if (license_type_id) {
      whereClauses.push('a.license_type_id = ?');
      queryParams.push(license_type_id);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total
       FROM applications a
       JOIN users u ON a.user_id = u.id
       ${whereSql}`,
      queryParams
    );

    const totalCount = countResult[0].total;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Allowed sort columns
    const allowedSortColumns = ['created_at', 'submitted_at', 'status', 'application_number'];
    const sortCol = allowedSortColumns.includes(sort_by) ? `a.${sort_by}` : 'a.created_at';
    const direction = sort_dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [applications] = await db.query(
      `SELECT a.id, a.application_number, a.status, a.vehicle_category, a.submitted_at, a.created_at, a.updated_at,
              u.id as user_id, u.full_name as applicant_name, u.email as applicant_email, u.mobile_number as applicant_mobile,
              lt.id as license_type_id, lt.name as license_type_name, lt.code as license_type_code,
              (SELECT COUNT(*) FROM documents d WHERE d.application_id = a.id) as total_docs,
              (SELECT COUNT(*) FROM documents d WHERE d.application_id = a.id AND d.verification_status = 'Verified') as verified_docs,
              (SELECT COUNT(*) FROM documents d WHERE d.application_id = a.id AND d.verification_status = 'Rejected') as rejected_docs
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN license_types lt ON a.license_type_id = lt.id
       ${whereSql}
       ORDER BY ${sortCol} ${direction}
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit, 10), offset]
    );

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit, 10))
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/applications/:id
async function getAdminApplicationDetails(req, res, next) {
  try {
    const applicationId = req.params.id;

    const [apps] = await db.query(
      `SELECT a.*, lt.name as license_type_name, lt.code as license_type_code, lt.minimum_age,
              u.id as user_id, u.full_name as applicant_name, u.email as applicant_email,
              u.mobile_number as applicant_mobile, u.date_of_birth as applicant_dob,
              u.address as applicant_address, u.created_at as applicant_registered_at
       FROM applications a
       JOIN license_types lt ON a.license_type_id = lt.id
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];

    // Documents
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE application_id = ? ORDER BY id ASC',
      [application.id]
    );

    // Appointments
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE application_id = ? ORDER BY created_at DESC',
      [application.id]
    );

    // Status History
    const [history] = await db.query(
      `SELECT ash.*, u.full_name as changed_by_name, u.role as changed_by_role
       FROM application_status_history ash
       LEFT JOIN users u ON ash.changed_by = u.id
       WHERE ash.application_id = ?
       ORDER BY ash.changed_at ASC`,
      [application.id]
    );

    res.status(200).json({
      success: true,
      application: {
        ...application,
        documents,
        appointments,
        history,
        allowedTransitions: ALLOWED_TRANSITIONS[application.status] || []
      }
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/applications/:id/status
async function updateApplicationStatus(req, res, next) {
  try {
    const applicationId = req.params.id;
    const adminId = req.user.id;
    const { status: newStatus, remarks, correction_instructions, rejection_reason } = req.body;

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const currentApp = apps[0];
    const currentStatus = currentApp.status;

    // Enforce valid status transition
    const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!validNextStates.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Illegal status transition from '${currentStatus}' to '${newStatus}'. Allowed next statuses: ${validNextStates.join(', ') || 'None (Terminal state)'}`
      });
    }

    // Require reason when rejecting
    if (newStatus === 'Rejected' && (!rejection_reason || !rejection_reason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting an application.'
      });
    }

    // Require instructions when correction required
    if (newStatus === 'Correction Required' && (!correction_instructions || !correction_instructions.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Correction instructions are mandatory when requesting applicant corrections.'
      });
    }

    // Update application_data with remarks / reasons
    const appData = typeof currentApp.application_data === 'object' ? currentApp.application_data : {};
    if (correction_instructions) appData.correctionInstructions = correction_instructions.trim();
    if (rejection_reason) appData.rejectionReason = rejection_reason.trim();
    if (remarks) appData.adminRemarks = remarks.trim();

    await db.query(
      `UPDATE applications
       SET status = ?, application_data = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, JSON.stringify(appData), applicationId]
    );

    const fullRemarks = remarks || (newStatus === 'Correction Required' ? `Correction requested: ${correction_instructions}` : (newStatus === 'Rejected' ? `Rejected: ${rejection_reason}` : `Status updated to ${newStatus}`));

    // Record history
    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [applicationId, currentStatus, newStatus, fullRemarks, adminId]
    );

    await logAudit({
      userId: adminId,
      action: 'APPLICATION_STATUS_UPDATED',
      entityType: 'applications',
      entityId: applicationId,
      details: { previousStatus: currentStatus, newStatus, remarks: fullRemarks },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Application status successfully updated to '${newStatus}'.`,
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/documents/:id/verification
async function verifyDocument(req, res, next) {
  try {
    const documentId = req.params.id;
    const adminId = req.user.id;
    const { status, remarks } = req.body; // status: 'Verified' | 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Verification status must be either "Verified" or "Rejected".'
      });
    }

    const [docs] = await db.query('SELECT * FROM documents WHERE id = ?', [documentId]);
    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await db.query(
      `UPDATE documents
       SET verification_status = ?, verification_remarks = ?, verified_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, remarks || null, documentId]
    );

    await logAudit({
      userId: adminId,
      action: 'DOCUMENT_VERIFIED',
      entityType: 'documents',
      entityId: documentId,
      details: { status, remarks, documentType: docs[0].document_type },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Document marked as ${status}.`,
      document: {
        id: documentId,
        verification_status: status,
        verification_remarks: remarks || null
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/appointments
async function adminScheduleAppointment(req, res, next) {
  try {
    const adminId = req.user.id;
    const { application_id, appointment_date, appointment_time, test_center } = req.body;

    if (!application_id || !appointment_date || !appointment_time || !test_center) {
      return res.status(400).json({
        success: false,
        message: 'All appointment details (application ID, date, time slot, test center) are required.'
      });
    }

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [application_id]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const [result] = await db.query(
      `INSERT INTO appointments (application_id, appointment_date, appointment_time, test_center, appointment_status, test_result, created_at)
       VALUES (?, ?, ?, ?, 'Scheduled', 'Pending', CURRENT_TIMESTAMP)`,
      [application_id, appointment_date, appointment_time, test_center]
    );

    const appointmentId = result.insertId;

    // Transition application status to 'Test Scheduled'
    const newStatus = 'Test Scheduled';
    await db.query('UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, application_id]);

    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        application_id,
        apps[0].status,
        newStatus,
        `Driving test scheduled by administrator for ${appointment_date} at ${test_center}.`,
        adminId
      ]
    );

    await logAudit({
      userId: adminId,
      action: 'ADMIN_SCHEDULED_APPOINTMENT',
      entityType: 'appointments',
      entityId: appointmentId,
      details: { application_id, appointment_date, appointment_time, test_center },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Driving test appointment scheduled successfully by administrator.',
      appointmentId
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/appointments/:id/result
async function recordTestResult(req, res, next) {
  try {
    const appointmentId = req.params.id;
    const adminId = req.user.id;
    const { test_result, remarks } = req.body; // 'Passed' | 'Failed'

    if (!['Passed', 'Failed'].includes(test_result)) {
      return res.status(400).json({
        success: false,
        message: 'Test result must be either "Passed" or "Failed".'
      });
    }

    const [appts] = await db.query('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (appts.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appt = appts[0];
    const applicationId = appt.application_id;

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Associated application not found.' });
    }

    const application = apps[0];

    // Update appointment record
    await db.query(
      `UPDATE appointments
       SET test_result = ?, appointment_status = 'Completed'
       WHERE id = ?`,
      [test_result, appointmentId]
    );

    // Determine new application status
    const newStatus = test_result === 'Passed' ? 'Test Passed' : 'Test Failed';

    await db.query(
      `UPDATE applications
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, applicationId]
    );

    const historyRemarks = remarks || (test_result === 'Passed' ? 'Applicant successfully cleared the official driving evaluation test.' : 'Applicant did not achieve required qualifying test criteria.');

    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [applicationId, application.status, newStatus, historyRemarks, adminId]
    );

    await logAudit({
      userId: adminId,
      action: 'TEST_RESULT_RECORDED',
      entityType: 'appointments',
      entityId: appointmentId,
      details: { test_result, applicationId, remarks: historyRemarks },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Driving test result recorded as '${test_result}'. Application status moved to '${newStatus}'.`,
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/applications/:id/issue-license
async function issueLicense(req, res, next) {
  try {
    const applicationId = req.params.id;
    const adminId = req.user.id;

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];

    // Only allow issuing license if test passed or if approved learner license
    if (!['Test Passed', 'Approved'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `License cannot be issued while application is in '${application.status}' status. Required: 'Test Passed' or 'Approved'.`
      });
    }

    const appData = typeof application.application_data === 'object' ? application.application_data : {};
    const testCenter = appData.testCenter || 'RTO Central';
    const licenseNumber = await generateLicenseNumber(testCenter);

    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const expiryYear = today.getFullYear() + 20; // 20 years validity standard
    const validTill = `${expiryYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    appData.licenseNumberIssued = licenseNumber;
    appData.issueDate = issueDate;
    appData.validTill = validTill;

    const newStatus = 'License Issued';

    await db.query(
      `UPDATE applications
       SET status = ?, application_data = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, JSON.stringify(appData), applicationId]
    );

    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        applicationId,
        application.status,
        newStatus,
        `Official Smart Driving License (${licenseNumber}) granted and activated. Valid until ${validTill}.`,
        adminId
      ]
    );

    await logAudit({
      userId: adminId,
      action: 'LICENSE_ISSUED',
      entityType: 'applications',
      entityId: applicationId,
      details: { licenseNumber, issueDate, validTill },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Driving license ${licenseNumber} issued successfully!`,
      licenseNumber,
      issueDate,
      validTill
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/reports
async function getAdminReports(req, res, next) {
  try {
    // 1. Status breakdown
    const [byStatus] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `);

    // 2. License type breakdown
    const [byType] = await db.query(`
      SELECT lt.name, lt.code, COUNT(a.id) as count
      FROM license_types lt
      LEFT JOIN applications a ON lt.id = a.license_type_id
      GROUP BY lt.id, lt.name, lt.code
    `);

    // 3. Test Pass vs Fail rate
    const [testStats] = await db.query(`
      SELECT test_result, COUNT(*) as count
      FROM appointments
      WHERE test_result IN ('Passed', 'Failed')
      GROUP BY test_result
    `);

    // 4. Test center utilization
    const [centerStats] = await db.query(`
      SELECT test_center, COUNT(*) as count
      FROM appointments
      GROUP BY test_center
    `);

    res.status(200).json({
      success: true,
      reports: {
        byStatus,
        byType,
        testStats,
        centerStats
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/applicants
async function getAdminApplicants(req, res, next) {
  try {
    const [applicants] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.mobile_number, u.date_of_birth, u.address, u.created_at,
             COUNT(a.id) as application_count
      FROM users u
      LEFT JOIN applications a ON u.id = a.user_id
      WHERE u.role = 'applicant'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      applicants
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/audit-logs
async function getAuditLogs(req, res, next) {
  try {
    const [logs] = await db.query(`
      SELECT al.*, u.full_name as user_name, u.role as user_role, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    res.status(200).json({
      success: true,
      logs
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminDashboard,
  getAdminApplications,
  getAdminApplicationDetails,
  updateApplicationStatus,
  verifyDocument,
  adminScheduleAppointment,
  recordTestResult,
  issueLicense,
  getAdminReports,
  getAdminApplicants,
  getAuditLogs
};
