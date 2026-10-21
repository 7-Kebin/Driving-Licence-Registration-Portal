-- ============================================================================
-- Driving License Registration Portal - Relational Database Schema
-- RDBMS: MySQL 8.0+
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `driving_license_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `driving_license_db`;

-- Drop tables in reverse dependency order if needed for clean re-creation
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `application_status_history`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `license_types`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `mobile_number` VARCHAR(20) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('applicant', 'admin') NOT NULL DEFAULT 'applicant',
  `date_of_birth` DATE NOT NULL,
  `address` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. License Types Table
CREATE TABLE `license_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `minimum_age` INT NOT NULL DEFAULT 18,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Applications Table
CREATE TABLE `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `license_type_id` INT NOT NULL,
  `vehicle_category` VARCHAR(100) NOT NULL,
  `application_data` JSON NOT NULL,
  `status` ENUM(
    'Draft',
    'Submitted',
    'Pending Review',
    'Correction Required',
    'Approved',
    'Rejected',
    'Test Scheduled',
    'Test Passed',
    'Test Failed',
    'License Issued'
  ) NOT NULL DEFAULT 'Draft',
  `submitted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_applications_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_applications_license_type` FOREIGN KEY (`license_type_id`) 
    REFERENCES `license_types` (`id`) ON DELETE RESTRICT,
  INDEX `idx_applications_app_number` (`application_number`),
  INDEX `idx_applications_user_id` (`user_id`),
  INDEX `idx_applications_status` (`status`),
  INDEX `idx_applications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Documents Table
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `document_type` ENUM(
    'identity_proof',
    'address_proof',
    'age_proof',
    'photograph',
    'signature'
  ) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `file_size` INT NULL,
  `mime_type` VARCHAR(100) NULL,
  `verification_status` ENUM('Pending', 'Verified', 'Rejected') NOT NULL DEFAULT 'Pending',
  `verification_remarks` TEXT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` TIMESTAMP NULL,
  CONSTRAINT `fk_documents_application` FOREIGN KEY (`application_id`) 
    REFERENCES `applications` (`id`) ON DELETE CASCADE,
  INDEX `idx_documents_application_id` (`application_id`),
  INDEX `idx_documents_status` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Appointments Table
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` VARCHAR(20) NOT NULL,
  `test_center` VARCHAR(255) NOT NULL,
  `appointment_status` ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') NOT NULL DEFAULT 'Scheduled',
  `test_result` ENUM('Pending', 'Passed', 'Failed') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_appointments_application` FOREIGN KEY (`application_id`) 
    REFERENCES `applications` (`id`) ON DELETE CASCADE,
  INDEX `idx_appointments_app_id` (`application_id`),
  INDEX `idx_appointments_date_center` (`appointment_date`, `test_center`, `appointment_time`),
  INDEX `idx_appointments_status` (`appointment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Application Status History Table
CREATE TABLE `application_status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `remarks` TEXT NULL,
  `changed_by` INT NULL,
  `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_history_application` FOREIGN KEY (`application_id`) 
    REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_changed_by` FOREIGN KEY (`changed_by`) 
    REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_history_app_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit Logs Table
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_audit_user_id` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
