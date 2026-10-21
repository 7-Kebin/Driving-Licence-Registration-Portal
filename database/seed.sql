-- ============================================================================
-- Driving License Registration Portal - Seed Data Script
-- RDBMS: MySQL 8.0+
-- ============================================================================

USE `driving_license_db`;

-- 1. Seed License Types
INSERT INTO `license_types` (`id`, `name`, `code`, `description`, `minimum_age`, `is_active`) VALUES
(1, 'Learner\'s License (LL)', 'LL', 'Provisional license valid for 6 months to practice driving under supervision of a licensed driver.', 16, 1),
(2, 'Permanent Driving License (DL)', 'DL', 'Standard driving license permitting operation of private personal motor vehicles.', 18, 1),
(3, 'Commercial / Transport Vehicle License (TR)', 'TR', 'Professional license for operating commercial freight vehicles, taxis, passenger buses, and heavy goods vehicles.', 20, 1),
(4, 'International Driving Permit (IDP)', 'IDP', 'Permit authorizing holding drivers to drive vehicles legally abroad in participating UN member countries.', 18, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `minimum_age`=VALUES(`minimum_age`);

-- 2. Seed Users
-- Password for Admin: Admin@Secure2026
-- Password for Applicants: Applicant@123
INSERT INTO `users` (`id`, `full_name`, `email`, `mobile_number`, `password_hash`, `role`, `date_of_birth`, `address`, `created_at`) VALUES
(1, 'Chief Licensing Officer', 'admin@portal.gov', '+91 80000 11223', '$2a$10$GB3PFFZ/sk/8JKHGDtwEVOxi9zwh8IS4gEtPdl7QCME4dB4koHpzO', 'admin', '1982-04-12', 'Regional Transport Office, Central Administrative Complex, New Delhi 110001', '2026-01-01 09:00:00'),
(2, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98765 43210', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '1998-05-14', '42 MG Road, Indiranagar, Bangalore, KA 560038', '2026-02-10 10:15:00'),
(3, 'Priya Patel', 'priya.patel@example.com', '+91 98234 56789', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '2001-11-20', '15 Sardar Patel Ring Road, Ahmedabad, GJ 380015', '2026-03-01 11:30:00'),
(4, 'Ananya Sen', 'ananya.sen@example.com', '+91 98111 22334', '$2a$10$yWFwOS36YPj9o1zmESnopu9At.A7kXPVdbmR9q.xFe.gkEeuzNZ8C', 'applicant', '1995-03-08', '7 Park Street, Kolkata, WB 700016', '2026-01-15 14:00:00')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`), `password_hash`=VALUES(`password_hash`);

-- 3. Seed Sample Applications
INSERT INTO `applications` (`id`, `application_number`, `user_id`, `license_type_id`, `vehicle_category`, `application_data`, `status`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 'DL-2026-104921', 3, 2, 'Light Motor Vehicle (LMV - Car)', 
 JSON_OBJECT(
   'applicantName', 'Priya Patel',
   'guardianName', 'Ramesh Patel',
   'relation', 'Father',
   'gender', 'Female',
   'bloodGroup', 'B+',
   'emergencyContact', '+91 98234 56780',
   'identificationMarks', 'Mole on right cheek',
   'testCenter', 'RTO Ahmedabad West (GJ-01)',
   'existingLicenseNumber', 'GJ01-LL-2025-99812',
   'declared', true
 ), 
 'Test Scheduled', '2026-03-05 14:20:00', '2026-03-05 14:00:00', '2026-03-07 10:00:00'),

(2, 'DL-2026-108234', 2, 1, 'Motorcycle with Gear (MCWG)', 
 JSON_OBJECT(
   'applicantName', 'Rahul Sharma',
   'guardianName', 'Vijay Sharma',
   'relation', 'Father',
   'gender', 'Male',
   'bloodGroup', 'O+',
   'emergencyContact', '+91 98765 43219',
   'identificationMarks', 'Scar on left elbow',
   'testCenter', 'RTO Bangalore Central (KA-01)',
   'declared', true
 ), 
 'Pending Review', '2026-03-10 11:45:00', '2026-03-10 11:30:00', '2026-03-10 11:45:00'),

(3, 'DL-2026-102115', 4, 2, 'LMV + MCWG (Car & Two Wheeler)', 
 JSON_OBJECT(
   'applicantName', 'Ananya Sen',
   'guardianName', 'Debashis Sen',
   'relation', 'Father',
   'gender', 'Female',
   'bloodGroup', 'A+',
   'emergencyContact', '+91 98111 22330',
   'identificationMarks', 'None',
   'testCenter', 'RTO Kolkata South (WB-02)',
   'licenseNumberIssued', 'DL-WB02-20260019284',
   'issueDate', '2026-02-28',
   'validTill', '2046-02-27',
   'declared', true
 ), 
 'License Issued', '2026-02-01 16:00:00', '2026-02-01 15:30:00', '2026-02-28 17:00:00'),

(4, 'DL-2026-109982', 2, 2, 'Light Motor Vehicle (LMV)', 
 JSON_OBJECT(
   'applicantName', 'Rahul Sharma',
   'guardianName', 'Vijay Sharma',
   'relation', 'Father',
   'gender', 'Male',
   'bloodGroup', 'O+',
   'emergencyContact', '+91 98765 43219',
   'identificationMarks', 'Scar on left elbow',
   'testCenter', 'RTO Bangalore Central (KA-01)',
   'correctionInstructions', 'The uploaded address proof is blurry. Please upload a clear color scan of your Aadhaar Card or Electricity Bill.',
   'declared', true
 ), 
 'Correction Required', '2026-03-12 09:15:00', '2026-03-12 09:00:00', '2026-03-13 14:00:00')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- 4. Seed Documents for Applications
INSERT INTO `documents` (`id`, `application_id`, `document_type`, `file_path`, `original_filename`, `file_size`, `mime_type`, `verification_status`, `verification_remarks`, `uploaded_at`, `verified_at`) VALUES
-- Application 1 Documents (Priya Patel) - Verified
(1, 1, 'identity_proof', 'uploads/sample_id_priya.pdf', 'Priya_Aadhaar_Card.pdf', 245000, 'application/pdf', 'Verified', 'Valid UIDAI card verified.', '2026-03-05 14:10:00', '2026-03-06 11:00:00'),
(2, 1, 'address_proof', 'uploads/sample_address_priya.pdf', 'Electricity_Bill_Feb2026.pdf', 312000, 'application/pdf', 'Verified', 'Address matches municipal records.', '2026-03-05 14:12:00', '2026-03-06 11:02:00'),
(3, 1, 'age_proof', 'uploads/sample_age_priya.pdf', '10th_Standard_Certificate.pdf', 410000, 'application/pdf', 'Verified', 'DOB verified as 2001-11-20.', '2026-03-05 14:13:00', '2026-03-06 11:03:00'),
(4, 1, 'photograph', 'uploads/sample_photo_priya.jpg', 'Passport_Photo.jpg', 98000, 'image/jpeg', 'Verified', 'Clear frontal photograph.', '2026-03-05 14:14:00', '2026-03-06 11:04:00'),
(5, 1, 'signature', 'uploads/sample_sig_priya.png', 'Specimen_Signature.png', 45000, 'image/png', 'Verified', 'Signature acceptable.', '2026-03-05 14:15:00', '2026-03-06 11:05:00'),

-- Application 2 Documents (Rahul Sharma - Pending Review)
(6, 2, 'identity_proof', 'uploads/sample_id_rahul.pdf', 'Rahul_Voter_ID.pdf', 180000, 'application/pdf', 'Pending', NULL, '2026-03-10 11:35:00', NULL),
(7, 2, 'address_proof', 'uploads/sample_address_rahul.pdf', 'Rental_Agreement.pdf', 420000, 'application/pdf', 'Pending', NULL, '2026-03-10 11:37:00', NULL),
(8, 2, 'age_proof', 'uploads/sample_age_rahul.pdf', 'PAN_Card.pdf', 190000, 'application/pdf', 'Pending', NULL, '2026-03-10 11:39:00', NULL),
(9, 2, 'photograph', 'uploads/sample_photo_rahul.jpg', 'Rahul_Passport_Photo.jpg', 88000, 'image/jpeg', 'Pending', NULL, '2026-03-10 11:40:00', NULL),
(10, 2, 'signature', 'uploads/sample_sig_rahul.png', 'Rahul_Signature.png', 52000, 'image/png', 'Pending', NULL, '2026-03-10 11:41:00', NULL),

-- Application 4 Documents (Rahul Sharma - Correction Required)
(11, 4, 'address_proof', 'uploads/sample_blurry_address.pdf', 'Old_Utility_Bill_Scan.pdf', 80000, 'application/pdf', 'Rejected', 'Image resolution too low; text unreadable. Please re-upload.', '2026-03-12 09:05:00', '2026-03-13 14:00:00')
ON DUPLICATE KEY UPDATE `verification_status`=VALUES(`verification_status`);

-- 5. Seed Appointments
INSERT INTO `appointments` (`id`, `application_id`, `appointment_date`, `appointment_time`, `test_center`, `appointment_status`, `test_result`, `created_at`) VALUES
(1, 1, '2026-11-05', '10:00 AM - 11:00 AM', 'RTO Ahmedabad West (GJ-01)', 'Scheduled', 'Pending', '2026-03-07 10:00:00'),
(2, 3, '2026-02-25', '02:00 PM - 03:00 PM', 'RTO Kolkata South (WB-02)', 'Completed', 'Passed', '2026-02-15 11:00:00')
ON DUPLICATE KEY UPDATE `appointment_status`=VALUES(`appointment_status`), `test_result`=VALUES(`test_result`);

-- 6. Seed Status History
INSERT INTO `application_status_history` (`id`, `application_id`, `previous_status`, `new_status`, `remarks`, `changed_by`, `changed_at`) VALUES
(1, 1, 'Draft', 'Submitted', 'Application submitted by applicant with 5 uploaded documents.', 3, '2026-03-05 14:20:00'),
(2, 1, 'Submitted', 'Pending Review', 'Application entered administrative verification queue.', 1, '2026-03-06 09:30:00'),
(3, 1, 'Pending Review', 'Approved', 'All documents verified successfully by Chief Licensing Officer.', 1, '2026-03-06 11:05:00'),
(4, 1, 'Approved', 'Test Scheduled', 'Driving practical test slot confirmed for 2026-11-05 at Ahmedabad West.', 3, '2026-03-07 10:00:00'),

(5, 2, 'Draft', 'Submitted', 'Application submitted by applicant.', 2, '2026-03-10 11:45:00'),
(6, 2, 'Submitted', 'Pending Review', 'Documents queued for RTO verification officer.', 1, '2026-03-10 12:00:00'),

(7, 3, 'Draft', 'Submitted', 'Submitted by Ananya Sen.', 4, '2026-02-01 16:00:00'),
(8, 3, 'Submitted', 'Approved', 'Approved after preliminary scrutiny.', 1, '2026-02-05 10:00:00'),
(9, 3, 'Approved', 'Test Scheduled', 'Driving test appointment fixed.', 4, '2026-02-15 11:00:00'),
(10, 3, 'Test Scheduled', 'Test Passed', 'Applicant passed driving simulation & road track test with score 94/100.', 1, '2026-02-25 15:30:00'),
(11, 3, 'Test Passed', 'License Issued', 'Smart Driving License DL-WB02-20260019284 dispatched and digitally issued.', 1, '2026-02-28 17:00:00'),

(12, 4, 'Draft', 'Submitted', 'Application submitted.', 2, '2026-03-12 09:15:00'),
(13, 4, 'Submitted', 'Correction Required', 'The uploaded address proof is blurry. Please upload a clear color scan.', 1, '2026-03-13 14:00:00')
ON DUPLICATE KEY UPDATE `remarks`=VALUES(`remarks`);

-- 7. Seed Audit Logs
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'SYSTEM_INIT', 'SYSTEM', 0, JSON_OBJECT('event', 'Initial database schema and seeds created'), '127.0.0.1', '2026-01-01 09:00:00'),
(2, 3, 'APPLICATION_SUBMITTED', 'application', 1, JSON_OBJECT('appNumber', 'DL-2026-104921'), '192.168.1.101', '2026-03-05 14:20:00'),
(3, 1, 'DOCUMENTS_VERIFIED', 'application', 1, JSON_OBJECT('verifiedDocsCount', 5), '192.168.1.5', '2026-03-06 11:05:00'),
(4, 3, 'APPOINTMENT_BOOKED', 'appointment', 1, JSON_OBJECT('date', '2026-11-05', 'time', '10:00 AM - 11:00 AM'), '192.168.1.101', '2026-03-07 10:00:00'),
(5, 1, 'TEST_RESULT_RECORDED', 'appointment', 2, JSON_OBJECT('result', 'Passed'), '192.168.1.5', '2026-02-25 15:30:00'),
(6, 1, 'LICENSE_ISSUED', 'application', 3, JSON_OBJECT('licenseNo', 'DL-WB02-20260019284'), '192.168.1.5', '2026-02-28 17:00:00')
ON DUPLICATE KEY UPDATE `action`=VALUES(`action`);
