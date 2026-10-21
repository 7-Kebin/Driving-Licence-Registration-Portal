const db = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const TEST_CENTERS = [
  { id: 'GJ-01', name: 'RTO Ahmedabad West (GJ-01)', address: 'Subhash Bridge, Ashram Road, Ahmedabad, Gujarat 380027' },
  { id: 'KA-01', name: 'RTO Bangalore Central (KA-01)', address: 'Koramangala BDA Complex, 3rd Block, Bangalore, Karnataka 560034' },
  { id: 'DL-01', name: 'RTO Delhi Central (DL-01)', address: 'Sarai Kale Khan, Ring Road, New Delhi 110013' },
  { id: 'MH-01', name: 'RTO Mumbai Central (MH-01)', address: 'Tardeo Road, Tulsiwadi, Mumbai, Maharashtra 400034' },
  { id: 'WB-02', name: 'RTO Kolkata South (WB-02)', address: 'Beltala Road, Lansdowne, Kolkata, West Bengal 700025' },
  { id: 'TN-01', name: 'RTO Chennai Central (TN-01)', address: 'Aynavaram, R.T.O Office Road, Chennai, Tamil Nadu 600023' }
];

const STANDARD_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM'
];

// GET /api/appointments/available-slots
async function getAvailableSlots(req, res, next) {
  try {
    const { test_center, date } = req.query;

    // Generate upcoming dates (next 14 days, excluding Sundays)
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0) { // Exclude Sunday
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    const selectedDate = date || dates[0];
    const selectedCenter = test_center || TEST_CENTERS[0].name;

    // Check booked slots for this center and date
    const [bookedRows] = await db.query(
      `SELECT appointment_time, COUNT(*) as booked_count
       FROM appointments
       WHERE appointment_date = ? AND test_center = ? AND appointment_status = 'Scheduled'
       GROUP BY appointment_time`,
      [selectedDate, selectedCenter]
    );

    const bookedMap = {};
    bookedRows.forEach(row => {
      bookedMap[row.appointment_time] = row.booked_count;
    });

    const maxCapacityPerSlot = 5;
    const slots = STANDARD_TIME_SLOTS.map(time => {
      const booked = bookedMap[time] || 0;
      return {
        time,
        totalCapacity: maxCapacityPerSlot,
        bookedCount: booked,
        available: booked < maxCapacityPerSlot,
        remainingSlots: Math.max(0, maxCapacityPerSlot - booked)
      };
    });

    res.status(200).json({
      success: true,
      centers: TEST_CENTERS,
      availableDates: dates,
      selectedDate,
      selectedCenter,
      slots
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments
async function bookAppointment(req, res, next) {
  try {
    const userId = req.user.id;
    const { application_id, appointment_date, appointment_time, test_center } = req.body;

    if (!application_id || !appointment_date || !appointment_time || !test_center) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application ID, appointment date, time slot, and test center.'
      });
    }

    // Verify application
    const [apps] = await db.query('SELECT * FROM applications WHERE id = ?', [application_id]);
    if (apps.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const application = apps[0];
    if (req.user.role !== 'admin' && application.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Application must be in 'Approved' or 'Test Failed' status to schedule a test
    if (!['Approved', 'Test Failed'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment can only be scheduled once application documents are Approved. Current status: '${application.status}'.`
      });
    }

    // Check for existing active scheduled appointment
    const [existing] = await db.query(
      `SELECT id FROM appointments WHERE application_id = ? AND appointment_status = 'Scheduled'`,
      [application_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A driving test appointment is already scheduled for this application. Please cancel or reschedule if needed.'
      });
    }

    // Check slot capacity (prevent conflicting bookings)
    const [slotCheck] = await db.query(
      `SELECT COUNT(*) as count FROM appointments
       WHERE appointment_date = ? AND appointment_time = ? AND test_center = ? AND appointment_status = 'Scheduled'`,
      [appointment_date, appointment_time, test_center]
    );

    if (slotCheck[0].count >= 5) {
      return res.status(409).json({
        success: false,
        message: 'The requested time slot is completely booked at this test center. Please select a different slot or date.'
      });
    }

    // Insert appointment
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
        application.status,
        newStatus,
        `Driving practical test scheduled for ${appointment_date} (${appointment_time}) at ${test_center}.`,
        userId
      ]
    );

    await logAudit({
      userId,
      action: 'APPOINTMENT_BOOKED',
      entityType: 'appointments',
      entityId: appointmentId,
      details: { application_id, appointment_date, appointment_time, test_center },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Driving test appointment confirmed successfully!',
      appointment: {
        id: appointmentId,
        application_id,
        appointment_date,
        appointment_time,
        test_center,
        appointment_status: 'Scheduled'
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/my-appointments
async function getMyAppointments(req, res, next) {
  try {
    const userId = req.user.id;

    const [appointments] = await db.query(
      `SELECT appt.*, a.application_number, a.status as application_status, a.vehicle_category,
              lt.name as license_type_name
       FROM appointments appt
       JOIN applications a ON appt.application_id = a.id
       JOIN license_types lt ON a.license_type_id = lt.id
       WHERE a.user_id = ?
       ORDER BY appt.appointment_date DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  TEST_CENTERS
};
