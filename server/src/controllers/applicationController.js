const db = require('../config/db');
const { generateApplicationNumber } = require('../utils/appNumberGenerator');
const { logAudit } = require('../utils/auditLogger');

// Determine next actionable step based on status
function calculateNextAction(status, appointment = null, applicationData = {}) {
  switch (status) {
    case 'Draft':
      return {
        step: 'Upload Documents & Submit',
        instruction: 'Please upload the mandatory verification documents and submit your application for RTO review.',
        actionType: 'SUBMIT_APPLICATION'
      };
    case 'Submitted':
    case 'Pending Review':
      return {
        step: 'Administrative Verification',
        instruction: 'Your application and uploaded documents are currently being scrutinized by the Licensing Officer.',
        actionType: 'WAIT_FOR_REVIEW'
      };
    case 'Correction Required':
      return {
        step: 'Submit Required Corrections',
        instruction: applicationData.correctionInstructions || 'The licensing authority has requested corrections on your application or documents.',
        actionType: 'CORRECT_APPLICATION'
      };
    case 'Approved':
      return {
        step: 'Schedule Driving Test Slot',
        instruction: 'Congratulations! Your documents are verified. Please book an eligible appointment slot for your driving test.',
        actionType: 'BOOK_APPOINTMENT'
      };
    case 'Test Scheduled':
      return {
        step: 'Appear for Driving Test',
        instruction: appointment ? `Please report to ${appointment.test_center} on ${appointment.appointment_date} at ${appointment.appointment_time} with your original documents and vehicle.` : 'Please arrive on time at the designated test center.',
        actionType: 'ATTEND_TEST'
      };
    case 'Test Passed':
      return {
        step: 'License Generation Pending',
        instruction: 'You have successfully passed your driving test. Your official Driving License is being authorized for issuance.',
        actionType: 'WAIT_FOR_ISSUANCE'
      };
    case 'Test Failed':
      return {
        step: 'Re-test Booking Required',
        instruction: 'Driving test criteria was not met. You may schedule a re-test appointment after the mandatory practice period (7 days).',
        actionType: 'REBOOK_TEST'
      };
    case 'License Issued':
      return {
        step: 'Driving License Active',
        instruction: `Your official driving license has been generated! License No: ${applicationData.licenseNumberIssued || 'Ready'}. You can download or print your smart license card.`,
        actionType: 'DOWNLOAD_LICENSE'
      };
    case 'Rejected':
      return {
        step: 'Application Closed',
        instruction: applicationData.rejectionReason || 'Your application was rejected by the licensing authority. Contact your local RTO for grievances.',
        actionType: 'NONE'
      };
    default:
      return { step: 'In Progress', instruction: 'Application is being processed.', actionType: 'NONE' };
  }
}

// POST /api/applications
async function createApplication(req, res, next) {
  try {
    const userId = req.user.id;
    const { license_type_id, vehicle_category, application_data, submit_now = false } = req.body;

    // Check if license type exists and is active
    const [ltRows] = await db.query('SELECT * FROM license_types WHERE id = ? AND is_active = 1', [license_type_id]);
    if (ltRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive license type selected.' });
    }

    // Verify age requirement against applicant DOB
    const [userRows] = await db.query('SELECT date_of_birth FROM users WHERE id = ?', [userId]);
    if (userRows.length > 0 && userRows[0].date_of_birth) {
      const dob = new Date(userRows[0].date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

      if (age < ltRows[0].minimum_age) {
        return res.status(400).json({
          success: false,
          message: `Applicant does not meet the minimum age requirement (${ltRows[0].minimum_age} years) for ${ltRows[0].name}. Current age: ${age} years.`
        });
      }
    }

    const appNumber = await generateApplicationNumber();
    const initialStatus = submit_now ? 'Submitted' : 'Draft';
    const submittedAt = submit_now ? new Date() : null;

    const dataString = typeof application_data === 'string' ? application_data : JSON.stringify(application_data || {});

    const [result] = await db.query(
      `INSERT INTO applications (application_number, user_id, license_type_id, vehicle_category, application_data, status, submitted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [appNumber, userId, license_type_id, vehicle_category, dataString, initialStatus, submittedAt]
    );

    const applicationId = result.insertId;

    // Record initial status history
    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, NULL, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [applicationId, initialStatus, submit_now ? 'Application created and submitted directly.' : 'Application draft created.', userId]
    );

    await logAudit({
      userId,
      action: 'APPLICATION_CREATED',
      entityType: 'applications',
      entityId: applicationId,
      details: { application_number: appNumber, license_type_id, vehicle_category, status: initialStatus },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: submit_now ? 'Application submitted successfully.' : 'Application draft created successfully.',
      application: {
        id: applicationId,
        application_number: appNumber,
        status: initialStatus,
        license_type_id,
        vehicle_category
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id
async function getApplicationById(req, res, next) {
  try {
    const applicationId = req.params.id;
    const isNum = !isNaN(applicationId);

    const [apps] = await db.query(
      `SELECT a.*, lt.name as license_type_name, lt.code as license_type_code, lt.minimum_age,
              u.full_name as applicant_name, u.email as applicant_email, u.mobile_number as applicant_mobile,
              u.date_of_birth as applicant_dob, u.address as applicant_address
       FROM applications a
       JOIN license_types lt ON a.license_type_id = lt.id
       JOIN users u ON a.user_id = u.id
       WHERE ${isNum ? 'a.id = ?' : 'a.application_number = ?'}`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];

    // Authorization: only applicant owner or admin can view
    if (req.user.role !== 'admin' && application.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view another applicant\'s record.'
      });
    }

    // Fetch documents
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE application_id = ? ORDER BY uploaded_at ASC',
      [application.id]
    );

    // Fetch appointment
    const [appointments] = await db.query(
      'SELECT * FROM appointments WHERE application_id = ? ORDER BY created_at DESC LIMIT 1',
      [application.id]
    );
    const appointment = appointments[0] || null;

    // Fetch status history with changed_by user name
    const [history] = await db.query(
      `SELECT ash.*, u.full_name as changed_by_name, u.role as changed_by_role
       FROM application_status_history ash
       LEFT JOIN users u ON ash.changed_by = u.id
       WHERE ash.application_id = ?
       ORDER BY ash.changed_at ASC`,
      [application.id]
    );

    const nextAction = calculateNextAction(application.status, appointment, application.application_data);

    res.status(200).json({
      success: true,
      application: {
        ...application,
        documents,
        appointment,
        history,
        nextAction
      }
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/applications/:id
async function updateApplication(req, res, next) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const { vehicle_category, application_data, resubmit = false } = req.body;

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const currentApp = apps[0];

    // Only owner or admin can edit
    if (req.user.role !== 'admin' && currentApp.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Enforce editing permissions: only Draft or Correction Required can be updated by applicant
    if (req.user.role !== 'admin' && !['Draft', 'Correction Required'].includes(currentApp.status)) {
      return res.status(400).json({
        success: false,
        message: `Application in '${currentApp.status}' status cannot be edited. Edits are only permitted during Draft or when Corrections are required.`
      });
    }

    let newStatus = currentApp.status;
    let remarks = 'Application details updated by applicant.';

    if (resubmit && currentApp.status === 'Correction Required') {
      newStatus = 'Pending Review';
      remarks = 'Corrections submitted by applicant. Queued for re-verification.';
    }

    // Merge existing application_data with updates
    const existingData = typeof currentApp.application_data === 'object' ? currentApp.application_data : {};
    const mergedData = { ...existingData, ...(application_data || {}) };
    const dataString = JSON.stringify(mergedData);

    await db.query(
      `UPDATE applications
       SET vehicle_category = COALESCE(?, vehicle_category),
           application_data = ?,
           status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [vehicle_category || null, dataString, newStatus, applicationId]
    );

    if (newStatus !== currentApp.status) {
      await db.query(
        `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [applicationId, currentApp.status, newStatus, remarks, userId]
      );
    }

    await logAudit({
      userId,
      action: 'APPLICATION_UPDATED',
      entityType: 'applications',
      entityId: applicationId,
      details: { previousStatus: currentApp.status, newStatus, resubmitted: resubmit },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: resubmit ? 'Corrections resubmitted successfully for review.' : 'Application details saved successfully.',
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/applications/:id/submit
async function submitApplication(req, res, next) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const currentApp = apps[0];
    if (req.user.role !== 'admin' && currentApp.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!['Draft', 'Correction Required'].includes(currentApp.status)) {
      return res.status(400).json({
        success: false,
        message: `Application is already in '${currentApp.status}' status and cannot be re-submitted.`
      });
    }

    // Check mandatory documents uploaded
    const [docs] = await db.query('SELECT document_type FROM documents WHERE application_id = ?', [applicationId]);
    const uploadedTypes = docs.map(d => d.document_type);
    const requiredTypes = ['identity_proof', 'address_proof', 'photograph', 'signature'];
    const missing = requiredTypes.filter(t => !uploadedTypes.includes(t));

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please upload all required documents before final submission. Missing: ${missing.join(', ')}.`
      });
    }

    const newStatus = 'Submitted';

    await db.query(
      `UPDATE applications
       SET status = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, applicationId]
    );

    await db.query(
      `INSERT INTO application_status_history (application_id, previous_status, new_status, remarks, changed_by, changed_at)
       VALUES (?, ?, ?, 'Application officially submitted by applicant with all mandatory verification documents.', ?, CURRENT_TIMESTAMP)`,
      [applicationId, currentApp.status, newStatus, userId]
    );

    await logAudit({
      userId,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'applications',
      entityId: applicationId,
      details: { application_number: currentApp.application_number },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Your application is now in the RTO scrutiny queue.',
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/track/:applicationNumber
async function trackApplication(req, res, next) {
  try {
    const { applicationNumber } = req.params;
    const cleanAppNumber = applicationNumber.trim().toUpperCase();

    const [apps] = await db.query(
      `SELECT a.id, a.application_number, a.status, a.vehicle_category, a.application_data,
              a.submitted_at, a.created_at, a.updated_at,
              lt.name as license_type_name, lt.code as license_type_code,
              u.full_name as applicant_name
       FROM applications a
       JOIN license_types lt ON a.license_type_id = lt.id
       JOIN users u ON a.user_id = u.id
       WHERE UPPER(a.application_number) = ?`,
      [cleanAppNumber]
    );

    if (apps.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No application found matching reference number "${cleanAppNumber}". Please check the number.`
      });
    }

    const application = apps[0];

    // Fetch appointment info if any
    const [appointments] = await db.query(
      'SELECT appointment_date, appointment_time, test_center, appointment_status, test_result FROM appointments WHERE application_id = ? ORDER BY created_at DESC LIMIT 1',
      [application.id]
    );
    const appointment = appointments[0] || null;

    // Fetch history
    const [history] = await db.query(
      `SELECT ash.previous_status, ash.new_status, ash.remarks, ash.changed_at,
              u.role as changed_by_role
       FROM application_status_history ash
       LEFT JOIN users u ON ash.changed_by = u.id
       WHERE ash.application_id = ?
       ORDER BY ash.changed_at ASC`,
      [application.id]
    );

    // Document counts
    const [docSummary] = await db.query(
      `SELECT COUNT(*) as total_docs,
              SUM(CASE WHEN verification_status = 'Verified' THEN 1 ELSE 0 END) as verified_docs,
              SUM(CASE WHEN verification_status = 'Rejected' THEN 1 ELSE 0 END) as rejected_docs
       FROM documents WHERE application_id = ?`,
      [application.id]
    );

    const nextAction = calculateNextAction(application.status, appointment, application.application_data);

    res.status(200).json({
      success: true,
      data: {
        application_number: application.application_number,
        applicant_name: application.applicant_name,
        license_type: application.license_type_name,
        vehicle_category: application.vehicle_category,
        status: application.status,
        submitted_at: application.submitted_at,
        created_at: application.created_at,
        updated_at: application.updated_at,
        nextAction,
        appointment,
        documents: docSummary[0],
        timeline: history
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/license-types
async function getLicenseTypes(req, res, next) {
  try {
    const [types] = await db.query('SELECT * FROM license_types WHERE is_active = 1 ORDER BY id ASC');
    res.status(200).json({ success: true, licenseTypes: types });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  getApplicationById,
  updateApplication,
  submitApplication,
  trackApplication,
  getLicenseTypes
};
