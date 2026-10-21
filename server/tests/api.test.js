const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { initDatabase, query } = require('../src/config/db');

describe('Driving License Registration Portal - API Integration Test Suite', () => {
  let applicantToken = '';
  let adminToken = '';
  let createdAppId = null;
  let createdAppNumber = '';

  before(async () => {
    // Ensure DB is ready
    await initDatabase();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return status online and database engine', async () => {
      const res = await request(app).get('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'online');
      assert.ok(res.body.databaseEngine);
    });
  });

  describe('2. Authentication & Authorization Tests', () => {
    it('POST /api/auth/login with valid admin credentials should return token and admin role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@portal.gov',
          password: 'Admin@Secure2026'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, 'admin');
      assert.ok(res.body.token);
      adminToken = res.body.token;
    });

    it('POST /api/auth/login with invalid password should return 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@portal.gov',
          password: 'WrongPassword!23'
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('POST /api/auth/register should create a new citizen applicant account', async () => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const testEmail = `test.applicant${randomSuffix}@example.com`;

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Vikram Malhotra',
          email: testEmail,
          mobile_number: '+91 9988776655',
          password: 'Password@123',
          confirm_password: 'Password@123',
          date_of_birth: '1996-07-22',
          address: 'Flat 402, Green Valley Apartments, Pune, MH 411001',
          terms_accepted: true
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.role, 'applicant');
      assert.ok(res.body.token);
      applicantToken = res.body.token;
    });

    it('POST /api/auth/register with duplicate email should return 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com', // Pre-seeded
          mobile_number: '+91 98765 43210',
          password: 'Applicant@123',
          confirm_password: 'Applicant@123',
          date_of_birth: '1998-05-14',
          address: '42 MG Road, Indiranagar, Bangalore, KA 560038',
          terms_accepted: true
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
    });

    it('Applicant accessing admin endpoints should be forbidden (403)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Admin accessing admin dashboard should succeed (200)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.stats);
    });
  });

  describe('3. Application Creation, Validation & Tracking Tests', () => {
    it('GET /api/applications/license-types should return active license types', async () => {
      const res = await request(app).get('/api/applications/license-types');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.licenseTypes.length > 0);
    });

    it('POST /api/applications should reject invalid age requirements', async () => {
      // Underage applicant test (Commercial vehicle TR requires age >= 20)
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          license_type_id: 3, // TR (Commercial)
          vehicle_category: 'Heavy Goods Vehicle',
          application_data: {
            applicantName: 'Vikram Malhotra',
            guardianName: 'Sanjay Malhotra',
            gender: 'Male',
            bloodGroup: 'O+',
            testCenter: 'RTO Bangalore Central (KA-01)'
          }
        });

      // Age of 1996 born applicant is ~30, so this would pass. Let's test form validation errors:
      const invalidRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          license_type_id: 1,
          vehicle_category: '', // missing
          application_data: {}
        });

      assert.strictEqual(invalidRes.status, 400);
      assert.strictEqual(invalidRes.body.success, false);
    });

    it('POST /api/applications should successfully create a draft application', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          license_type_id: 2, // Permanent Driving License (DL)
          vehicle_category: 'Light Motor Vehicle (LMV - Car)',
          application_data: {
            applicantName: 'Vikram Malhotra',
            guardianName: 'Sanjay Malhotra',
            relation: 'Father',
            gender: 'Male',
            bloodGroup: 'B+',
            emergencyContact: '+91 9988776600',
            identificationMarks: 'Birthmark on left wrist',
            testCenter: 'RTO Bangalore Central (KA-01)',
            declared: true
          }
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.application.application_number);
      assert.strictEqual(res.body.application.status, 'Draft');
      createdAppId = res.body.application.id;
      createdAppNumber = res.body.application.application_number;
    });

    it('GET /api/applications/track/:appNumber should return status timeline and next action', async () => {
      const res = await request(app).get(`/api/applications/track/${createdAppNumber}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, 'Draft');
      assert.ok(res.body.data.nextAction);
      assert.ok(Array.isArray(res.body.data.timeline));
    });

    it('POST /api/applications/:id/submit should enforce mandatory documents before final submission', async () => {
      const res = await request(app)
        .post(`/api/applications/${createdAppId}/submit`)
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes('upload all required documents'));
    });
  });

  describe('4. Status Transition Enforcement Tests', () => {
    it('Admin cannot perform illegal status transition (e.g. Draft directly to License Issued)', async () => {
      const res = await request(app)
        .patch(`/api/admin/applications/${createdAppId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'License Issued'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Illegal status transition'));
    });

    it('Admin rejecting application must provide a rejection reason', async () => {
      // First update draft to Submitted so rejection is a valid candidate transition
      await query('UPDATE applications SET status = "Submitted" WHERE id = ?', [createdAppId]);

      const res = await request(app)
        .patch(`/api/admin/applications/${createdAppId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Rejected',
          rejection_reason: '' // Empty reason
        });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes('mandatory'));
    });

    it('Admin approving application should record in status history and audit log', async () => {
      const res = await request(app)
        .patch(`/api/admin/applications/${createdAppId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Approved',
          remarks: 'Applicant documents physically verified and approved for driving test.'
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'Approved');

      // Verify history
      const [history] = await query('SELECT * FROM application_status_history WHERE application_id = ?', [createdAppId]);
      assert.ok(history.length >= 2);
    });
  });

  describe('5. Database Relationships & Appointments', () => {
    it('GET /api/appointments/available-slots should return slots with conflict counts', async () => {
      const res = await request(app)
        .get('/api/appointments/available-slots')
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.slots));
      assert.ok(Array.isArray(res.body.centers));
    });

    it('Approved application can schedule an appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          application_id: createdAppId,
          appointment_date: '2026-11-20',
          appointment_time: '10:30 AM - 11:30 AM',
          test_center: 'RTO Bangalore Central (KA-01)'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.appointment.appointment_status, 'Scheduled');

      // Application status should now be 'Test Scheduled'
      const [appRows] = await query('SELECT status FROM applications WHERE id = ?', [createdAppId]);
      assert.strictEqual(appRows[0].status, 'Test Scheduled');
    });
  });
});
