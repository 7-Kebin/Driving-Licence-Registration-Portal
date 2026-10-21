const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let dbType = 'mysql'; // 'mysql' | 'sqlite'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'driving_license_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// SQLite helper to execute queries with mysql2-like [rows, fields] signature
function sqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Convert MySQL style placeholders (?) which SQLite also supports
    const trimmed = sql.trim();
    const isSelect = /^SELECT|^PRAGMA|^SHOW/i.test(trimmed);

    if (isSelect) {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        // Automatically parse JSON fields if needed
        const parsedRows = rows.map(row => {
          const newRow = { ...row };
          if (newRow.application_data && typeof newRow.application_data === 'string') {
            try { newRow.application_data = JSON.parse(newRow.application_data); } catch (_) {}
          }
          if (newRow.details && typeof newRow.details === 'string') {
            try { newRow.details = JSON.parse(newRow.details); } catch (_) {}
          }
          return newRow;
        });
        resolve([parsedRows, []]);
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        const result = {
          insertId: this.lastID,
          affectedRows: this.changes,
          changedRows: this.changes
        };
        resolve([result, []]);
      });
    }
  });
}

// SQLite connection wrapper matching MySQL pool connection interface
function getSqliteConnection() {
  return {
    query: (sql, params) => sqliteQuery(sql, params),
    execute: (sql, params) => sqliteQuery(sql, params),
    beginTransaction: () => sqliteQuery('BEGIN TRANSACTION'),
    commit: () => sqliteQuery('COMMIT'),
    rollback: () => sqliteQuery('ROLLBACK'),
    release: () => {}
  };
}

async function initDatabase() {
  // 1. First attempt to connect to MySQL
  try {
    console.log(`[Database] Attempting connection to MySQL at ${config.host}:${config.port}...`);
    // Connect without DB first to ensure DB exists
    const tempConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      connectTimeout: 2000
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConnection.end();

    // Create pooled connection
    pool = mysql.createPool(config);
    const [test] = await pool.query('SELECT 1 + 1 AS result');
    if (test) {
      dbType = 'mysql';
      console.log(`[Database] Successfully connected to MySQL database: ${config.database}`);
      await runMysqlMigrationsAndSeeds();
      return;
    }
  } catch (mysqlErr) {
    console.warn(`[Database] MySQL unavailable (${mysqlErr.message}).`);
    console.log(`[Database] Activating Relational SQL Engine (SQLite) with identical MySQL schema and constraints.`);
  }

  // 2. Fallback to SQLite Relational Engine
  dbType = 'sqlite';
  const dbDir = path.resolve(__dirname, '../../../database');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, 'driving_license_db.sqlite');

  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[Database] Failed to open SQLite database:', err);
    } else {
      console.log(`[Database] Connected to Relational SQLite database at ${dbPath}`);
    }
  });

  // Enable foreign keys
  await new Promise((resolve) => sqliteDb.run('PRAGMA foreign_keys = ON;', resolve));
  await runSqliteMigrationsAndSeeds();
}

async function runMysqlMigrationsAndSeeds() {
  try {
    const schemaFile = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaFile)) {
      // Check if users table already exists
      const [tables] = await pool.query(`SHOW TABLES LIKE 'users'`);
      if (tables.length === 0) {
        console.log('[Database] Running MySQL schema migrations...');
        const sql = fs.readFileSync(schemaFile, 'utf8');
        // Execute multi-statement SQL
        const statements = sql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (e) {
            console.error('[Database Migration Error]', e.message);
          }
        }
        console.log('[Database] MySQL schema tables created successfully.');
      }
    }

    // Check if seeds are needed
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('[Database] Seeding initial database records...');
      const seedFile = path.resolve(__dirname, '../../../database/seed.sql');
      if (fs.existsSync(seedFile)) {
        const seedSql = fs.readFileSync(seedFile, 'utf8');
        const statements = seedSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (e) {
            console.error('[Database Seed Error]', e.message);
          }
        }
        console.log('[Database] Seed data populated successfully.');
      }
    }
  } catch (err) {
    console.error('[Database Migration/Seed Failed]', err.message);
  }
}

async function runSqliteMigrationsAndSeeds() {
  const run = (sql) => new Promise((resolve, reject) => {
    sqliteDb.run(sql, (err) => err ? reject(err) : resolve());
  });

  try {
    // 1. Create tables
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        mobile_number TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'applicant',
        date_of_birth TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS license_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        minimum_age INTEGER NOT NULL DEFAULT 18,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        license_type_id INTEGER NOT NULL,
        vehicle_category TEXT NOT NULL,
        application_data TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        submitted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (license_type_id) REFERENCES license_types(id)
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        verification_status TEXT NOT NULL DEFAULT 'Pending',
        verification_remarks TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        test_center TEXT NOT NULL,
        appointment_status TEXT NOT NULL DEFAULT 'Scheduled',
        test_result TEXT NOT NULL DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        remarks TEXT,
        changed_by INTEGER,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Check if seed data exists
    const [users] = await sqliteQuery('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('[Database] Populating default seed data in SQLite database...');
      // Insert license types
      await sqliteQuery(`
        INSERT INTO license_types (id, name, code, description, minimum_age, is_active) VALUES
        (1, 'Learner''s License (LL)', 'LL', 'Provisional license valid for 6 months to practice driving under supervision.', 16, 1),
        (2, 'Permanent Driving License (DL)', 'DL', 'Standard driving license permitting operation of private personal motor vehicles.', 18, 1),
        (3, 'Commercial / Transport Vehicle License (TR)', 'TR', 'Professional license for operating commercial freight vehicles, taxis, and buses.', 20, 1),
        (4, 'International Driving Permit (IDP)', 'IDP', 'Permit authorizing driving legally abroad in UN member countries.', 18, 1)
      `);

      // Insert users (Admin + Sample Applicants)
      // Passwords: Admin@Secure2026 and Applicant@123
      await sqliteQuery(`
        INSERT INTO users (id, full_name, email, mobile_number, password_hash, role, date_of_birth, address) VALUES
        (1, 'Chief Licensing Officer', 'admin@portal.gov', '+91 80000 11223', '$2a$10$GB3PFFZ/sk/8JKHGDtwEVOxi9zwh8IS4gEtPdl7QCME4dB4koHpzO', 'admin', '1982-04-12', 'Regional Transport Office, Central Complex, New Delhi 110001'),
        (2, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98765 43210', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '1998-05-14', '42 MG Road, Indiranagar, Bangalore, KA 560038'),
        (3, 'Priya Patel', 'priya.patel@example.com', '+91 98234 56789', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '2001-11-20', '15 Sardar Patel Ring Road, Ahmedabad, GJ 380015'),
        (4, 'Ananya Sen', 'ananya.sen@example.com', '+91 98111 22334', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '1995-03-08', '7 Park Street, Kolkata, WB 700016')
      `);

      // Insert applications
      const priyaData = JSON.stringify({
        applicantName: 'Priya Patel',
        guardianName: 'Ramesh Patel',
        relation: 'Father',
        gender: 'Female',
        bloodGroup: 'B+',
        emergencyContact: '+91 98234 56780',
        identificationMarks: 'Mole on right cheek',
        testCenter: 'RTO Ahmedabad West (GJ-01)',
        existingLicenseNumber: 'GJ01-LL-2025-99812',
        declared: true
      });

      const rahulData1 = JSON.stringify({
        applicantName: 'Rahul Sharma',
        guardianName: 'Vijay Sharma',
        relation: 'Father',
        gender: 'Male',
        bloodGroup: 'O+',
        emergencyContact: '+91 98765 43219',
        identificationMarks: 'Scar on left elbow',
        testCenter: 'RTO Bangalore Central (KA-01)',
        declared: true
      });

      const ananyaData = JSON.stringify({
        applicantName: 'Ananya Sen',
        guardianName: 'Debashis Sen',
        relation: 'Father',
        gender: 'Female',
        bloodGroup: 'A+',
        emergencyContact: '+91 98111 22330',
        identificationMarks: 'None',
        testCenter: 'RTO Kolkata South (WB-02)',
        licenseNumberIssued: 'DL-WB02-20260019284',
        issueDate: '2026-02-28',
        validTill: '2046-02-27',
        declared: true
      });

      const rahulData2 = JSON.stringify({
        applicantName: 'Rahul Sharma',
        guardianName: 'Vijay Sharma',
        relation: 'Father',
        gender: 'Male',
        bloodGroup: 'O+',
        emergencyContact: '+91 98765 43219',
        identificationMarks: 'Scar on left elbow',
        testCenter: 'RTO Bangalore Central (KA-01)',
        correctionInstructions: 'The uploaded address proof is blurry. Please upload a clear color scan of your Aadhaar Card or Electricity Bill.',
        declared: true
      });

      await sqliteQuery(`
        INSERT INTO applications (id, application_number, user_id, license_type_id, vehicle_category, application_data, status, submitted_at) VALUES
        (1, 'DL-2026-104921', 3, 2, 'Light Motor Vehicle (LMV - Car)', ?, 'Test Scheduled', '2026-03-05 14:20:00'),
        (2, 'DL-2026-108234', 2, 1, 'Motorcycle with Gear (MCWG)', ?, 'Pending Review', '2026-03-10 11:45:00'),
        (3, 'DL-2026-102115', 4, 2, 'LMV + MCWG (Car & Two Wheeler)', ?, 'License Issued', '2026-02-01 16:00:00'),
        (4, 'DL-2026-109982', 2, 2, 'Light Motor Vehicle (LMV)', ?, 'Correction Required', '2026-03-12 09:15:00')
      `, [priyaData, rahulData1, ananyaData, rahulData2]);

      // Seed documents
      await sqliteQuery(`
        INSERT INTO documents (id, application_id, document_type, file_path, original_filename, file_size, mime_type, verification_status, verification_remarks) VALUES
        (1, 1, 'identity_proof', 'uploads/sample_id_priya.pdf', 'Priya_Aadhaar_Card.pdf', 245000, 'application/pdf', 'Verified', 'Valid UIDAI card verified.'),
        (2, 1, 'address_proof', 'uploads/sample_address_priya.pdf', 'Electricity_Bill_Feb2026.pdf', 312000, 'application/pdf', 'Verified', 'Address matches municipal records.'),
        (3, 1, 'age_proof', 'uploads/sample_age_priya.pdf', '10th_Standard_Certificate.pdf', 410000, 'application/pdf', 'Verified', 'DOB verified as 2001-11-20.'),
        (4, 1, 'photograph', 'uploads/sample_photo_priya.jpg', 'Passport_Photo.jpg', 98000, 'image/jpeg', 'Verified', 'Clear frontal photograph.'),
        (5, 1, 'signature', 'uploads/sample_sig_priya.png', 'Specimen_Signature.png', 45000, 'image/png', 'Verified', 'Signature acceptable.'),
        (6, 2, 'identity_proof', 'uploads/sample_id_rahul.pdf', 'Rahul_Voter_ID.pdf', 180000, 'application/pdf', 'Pending', NULL),
        (7, 2, 'address_proof', 'uploads/sample_address_rahul.pdf', 'Rental_Agreement.pdf', 420000, 'application/pdf', 'Pending', NULL),
        (8, 2, 'age_proof', 'uploads/sample_age_rahul.pdf', 'PAN_Card.pdf', 190000, 'application/pdf', 'Pending', NULL),
        (9, 2, 'photograph', 'uploads/sample_photo_rahul.jpg', 'Rahul_Passport_Photo.jpg', 88000, 'image/jpeg', 'Pending', NULL),
        (10, 2, 'signature', 'uploads/sample_sig_rahul.png', 'Rahul_Signature.png', 52000, 'image/png', 'Pending', NULL),
        (11, 4, 'address_proof', 'uploads/sample_blurry_address.pdf', 'Old_Utility_Bill_Scan.pdf', 80000, 'application/pdf', 'Rejected', 'Image resolution too low; text unreadable.')
      `);

      // Seed appointments
      await sqliteQuery(`
        INSERT INTO appointments (id, application_id, appointment_date, appointment_time, test_center, appointment_status, test_result) VALUES
        (1, 1, '2026-11-05', '10:00 AM - 11:00 AM', 'RTO Ahmedabad West (GJ-01)', 'Scheduled', 'Pending'),
        (2, 3, '2026-02-25', '02:00 PM - 03:00 PM', 'RTO Kolkata South (WB-02)', 'Completed', 'Passed')
      `);

      // Seed history
      await sqliteQuery(`
        INSERT INTO application_status_history (id, application_id, previous_status, new_status, remarks, changed_by) VALUES
        (1, 1, 'Draft', 'Submitted', 'Application submitted by applicant with 5 uploaded documents.', 3),
        (2, 1, 'Submitted', 'Pending Review', 'Application entered administrative verification queue.', 1),
        (3, 1, 'Pending Review', 'Approved', 'All documents verified successfully by Chief Licensing Officer.', 1),
        (4, 1, 'Approved', 'Test Scheduled', 'Driving practical test slot confirmed for 2026-11-05 at Ahmedabad West.', 3),
        (5, 2, 'Draft', 'Submitted', 'Application submitted by applicant.', 2),
        (6, 2, 'Submitted', 'Pending Review', 'Documents queued for RTO verification officer.', 1),
        (7, 3, 'Draft', 'Submitted', 'Submitted by Ananya Sen.', 4),
        (8, 3, 'Submitted', 'Approved', 'Approved after preliminary scrutiny.', 1),
        (9, 3, 'Approved', 'Test Scheduled', 'Driving test appointment fixed.', 4),
        (10, 3, 'Test Scheduled', 'Test Passed', 'Applicant passed driving simulation & road track test with score 94/100.', 1),
        (11, 3, 'Test Passed', 'License Issued', 'Smart Driving License DL-WB02-20260019284 dispatched and digitally issued.', 1),
        (12, 4, 'Draft', 'Submitted', 'Application submitted.', 2),
        (13, 4, 'Submitted', 'Correction Required', 'The uploaded address proof is blurry. Please upload a clear color scan.', 1)
      `);

      // Seed audit logs
      await sqliteQuery(`
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address) VALUES
        (1, 1, 'SYSTEM_INIT', 'SYSTEM', 0, '{"event":"Initial database schema and seeds created"}', '127.0.0.1'),
        (2, 3, 'APPLICATION_SUBMITTED', 'application', 1, '{"appNumber":"DL-2026-104921"}', '192.168.1.101'),
        (3, 1, 'DOCUMENTS_VERIFIED', 'application', 1, '{"verifiedDocsCount":5}', '192.168.1.5'),
        (4, 3, 'APPOINTMENT_BOOKED', 'appointment', 1, '{"date":"2026-11-05","time":"10:00 AM - 11:00 AM"}', '192.168.1.101'),
        (5, 1, 'TEST_RESULT_RECORDED', 'appointment', 2, '{"result":"Passed"}', '192.168.1.5'),
        (6, 1, 'LICENSE_ISSUED', 'application', 3, '{"licenseNo":"DL-WB02-20260019284"}', '192.168.1.5')
      `);

      console.log('[Database] SQLite seed records successfully created.');
    }
  } catch (err) {
    console.error('[Database SQLite Init Error]', err);
  }
}

// Universal query dispatcher
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    return pool.query(sql, params);
  } else {
    return sqliteQuery(sql, params);
  }
}

async function execute(sql, params = []) {
  if (dbType === 'mysql') {
    return pool.execute(sql, params);
  } else {
    return sqliteQuery(sql, params);
  }
}

async function getConnection() {
  if (dbType === 'mysql') {
    return pool.getConnection();
  } else {
    return getSqliteConnection();
  }
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  execute,
  getConnection,
  getDbType
};
