-- Generated from entities/*.json
CREATE DATABASE IF NOT EXISTS `mediflow` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mediflow`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Appointment
CREATE TABLE IF NOT EXISTS `appointment` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `doctor_id` VARCHAR(64) NULL,
  `doctor_name` VARCHAR(255) NOT NULL,
  `department` ENUM('general', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology', 'ophthalmology', 'ent', 'surgery', 'emergency') NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(255) NULL,
  `reason` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show') NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_appointment_facility_id` (`facility_id`),
  KEY `idx_appointment_patient_id` (`patient_id`),
  KEY `idx_appointment_doctor_id` (`doctor_id`)
,  CONSTRAINT `fk_appointment_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_appointment_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Bill
CREATE TABLE IF NOT EXISTS `bill` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `bill_number` VARCHAR(255) NULL,
  `bill_date` DATE NULL,
  `items` JSON NULL,
  `subtotal` DECIMAL(12,2) NULL,
  `tax` DECIMAL(12,2) NULL,
  `discount` DECIMAL(12,2) NULL,
  `total_amount` DECIMAL(12,2) NULL,
  `amount_paid` DECIMAL(12,2) NULL DEFAULT 0,
  `insurance_covered` DECIMAL(12,2) NULL DEFAULT 0,
  `payment_method` ENUM('cash', 'card', 'insurance', 'bank_transfer', 'mobile_money') NULL,
  `notes` TEXT NULL,
  `status` ENUM('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled') NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_bill_facility_id` (`facility_id`),
  KEY `idx_bill_patient_id` (`patient_id`)
,  CONSTRAINT `fk_bill_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bill_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ClinicalEncounter
CREATE TABLE IF NOT EXISTS `clinical_encounter` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `patient_age` VARCHAR(255) NULL,
  `patient_gender` VARCHAR(255) NULL,
  `clinician` VARCHAR(255) NULL,
  `encounter_date` DATE NULL,
  `encounter_time` VARCHAR(255) NULL,
  `chief_complaint` TEXT NULL,
  `history_of_presenting_illness` TEXT NULL,
  `vital_signs` JSON NULL,
  `examination_findings` TEXT NULL,
  `diagnosis` TEXT NULL,
  `treatment_plan` TEXT NULL,
  `lab_orders` JSON NULL,
  `imaging_orders` JSON NULL,
  `prescription_ids` JSON NULL,
  `admitted` TINYINT(1) NULL DEFAULT 0,
  `admission_ward` VARCHAR(255) NULL,
  `referral_department` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('open', 'in_progress', 'completed', 'referred', 'admitted') NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_clinical_encounter_facility_id` (`facility_id`),
  KEY `idx_clinical_encounter_patient_id` (`patient_id`)
,  CONSTRAINT `fk_clinical_encounter_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_clinical_encounter_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Equipment
CREATE TABLE IF NOT EXISTS `equipment` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('diagnostic', 'therapeutic', 'surgical', 'monitoring', 'laboratory', 'imaging', 'life_support', 'other') NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `manufacturer` VARCHAR(255) NULL,
  `model` VARCHAR(255) NULL,
  `department` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `purchase_date` DATE NULL,
  `warranty_expiry` DATE NULL,
  `last_maintenance` DATE NULL,
  `next_maintenance` DATE NULL,
  `cost` DECIMAL(12,2) NULL,
  `condition` ENUM('excellent', 'good', 'fair', 'poor', 'out_of_service') NULL DEFAULT 'good',
  `status` ENUM('active', 'maintenance', 'decommissioned', 'repair') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_equipment_facility_id` (`facility_id`)
,  CONSTRAINT `fk_equipment_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Facility
CREATE TABLE IF NOT EXISTS `facility` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('hospital', 'clinic', 'health_center', 'laboratory', 'pharmacy') NULL DEFAULT 'hospital',
  `address` TEXT NULL,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `license_number` VARCHAR(255) NULL,
  `logo_url` VARCHAR(255) NULL,
  `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- HealthWorker
CREATE TABLE IF NOT EXISTS `health_worker` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `role` ENUM('doctor', 'nurse', 'pharmacist', 'lab_technician', 'radiologist', 'surgeon', 'anesthesiologist', 'physiotherapist', 'admin', 'other') NOT NULL,
  `specialization` VARCHAR(255) NULL,
  `department` ENUM('general', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'dermatology', 'ophthalmology', 'ent', 'surgery', 'emergency', 'radiology', 'laboratory', 'pharmacy', 'admin') NULL,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `license_number` VARCHAR(255) NULL,
  `hire_date` DATE NULL,
  `shift` ENUM('morning', 'afternoon', 'night', 'rotating') NULL,
  `qualification` VARCHAR(255) NULL,
  `experience_years` INT NULL,
  `status` ENUM('active', 'on_leave', 'suspended', 'terminated') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_health_worker_facility_id` (`facility_id`)
,  CONSTRAINT `fk_health_worker_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ImagingOrder
CREATE TABLE IF NOT EXISTS `imaging_order` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `imaging_type` ENUM('xray', 'ct_scan', 'mri', 'ultrasound', 'mammography', 'pet_scan', 'fluoroscopy', 'other') NOT NULL,
  `body_part` VARCHAR(255) NULL,
  `ordered_by` VARCHAR(255) NULL,
  `order_date` DATE NULL,
  `priority` ENUM('routine', 'urgent', 'stat') NULL DEFAULT 'routine',
  `findings` TEXT NULL,
  `report_url` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('ordered', 'scheduled', 'in_progress', 'completed', 'cancelled') NULL DEFAULT 'ordered',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_imaging_order_facility_id` (`facility_id`),
  KEY `idx_imaging_order_patient_id` (`patient_id`)
,  CONSTRAINT `fk_imaging_order_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_imaging_order_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- InpatientAdmission
CREATE TABLE IF NOT EXISTS `inpatient_admission` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `admitting_doctor` VARCHAR(255) NULL,
  `ward` ENUM('general', 'medical', 'icu', 'pediatrics', 'maternity', 'surgical', 'emergency', 'cardiology', 'neurology', 'orthopedics') NOT NULL,
  `bed_number` VARCHAR(255) NULL,
  `admission_date` DATE NOT NULL,
  `admission_reason` VARCHAR(255) NULL,
  `diagnosis` TEXT NULL,
  `discharge_date` DATE NULL,
  `discharge_summary` TEXT NULL,
  `notes` TEXT NULL,
  `status` ENUM('active', 'discharged', 'transferred', 'deceased') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_inpatient_admission_facility_id` (`facility_id`),
  KEY `idx_inpatient_admission_patient_id` (`patient_id`)
,  CONSTRAINT `fk_inpatient_admission_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inpatient_admission_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- InventoryItem
CREATE TABLE IF NOT EXISTS `inventory_item` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('medical_supplies', 'surgical', 'ppe', 'cleaning', 'office', 'linen', 'food', 'other') NULL,
  `sku` VARCHAR(255) NOT NULL,
  `unit` ENUM('pieces', 'boxes', 'packets', 'liters', 'kg', 'rolls', 'pairs', 'sets') NULL,
  `quantity_in_stock` INT NULL DEFAULT 0,
  `reorder_level` INT NULL DEFAULT 20,
  `unit_cost` DECIMAL(12,2) NULL,
  `supplier` VARCHAR(255) NULL,
  `location` VARCHAR(255) NULL,
  `last_restocked` DATE NULL,
  `expiry_date` DATE NULL,
  `status` ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued') NULL DEFAULT 'in_stock',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_inventory_item_facility_id` (`facility_id`)
,  CONSTRAINT `fk_inventory_item_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- LabTest
CREATE TABLE IF NOT EXISTS `lab_test` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `test_type` ENUM('blood_count', 'urinalysis', 'lipid_panel', 'liver_function', 'kidney_function', 'thyroid', 'glucose', 'hba1c', 'electrolytes', 'coagulation', 'culture', 'other') NULL,
  `test_name` VARCHAR(255) NOT NULL,
  `ordered_by` VARCHAR(255) NULL,
  `order_date` DATE NULL,
  `priority` ENUM('routine', 'urgent', 'stat') NULL DEFAULT 'routine',
  `price` DECIMAL(12,2) NULL DEFAULT 0,
  `results` TEXT NULL,
  `result_date` DATE NULL,
  `normal_range` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` ENUM('ordered', 'sample_collected', 'processing', 'completed', 'cancelled') NULL DEFAULT 'ordered',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_lab_test_facility_id` (`facility_id`),
  KEY `idx_lab_test_patient_id` (`patient_id`)
,  CONSTRAINT `fk_lab_test_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_test_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Medication
CREATE TABLE IF NOT EXISTS `medication` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `name` VARCHAR(255) NOT NULL,
  `generic_name` VARCHAR(255) NULL,
  `category` ENUM('antibiotic', 'analgesic', 'antihypertensive', 'antidiabetic', 'anticoagulant', 'antidepressant', 'antihistamine', 'steroid', 'vitamin', 'vaccine', 'other') NULL,
  `dosage_form` ENUM('tablet', 'capsule', 'injection', 'syrup', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'other') NULL,
  `strength` VARCHAR(255) NULL,
  `manufacturer` VARCHAR(255) NULL,
  `unit_price` DECIMAL(12,2) NULL,
  `stock_quantity` INT NULL DEFAULT 0,
  `reorder_level` INT NULL DEFAULT 10,
  `expiry_date` DATE NULL,
  `batch_number` VARCHAR(255) NULL,
  `storage_conditions` TEXT NULL,
  `status` ENUM('available', 'low_stock', 'out_of_stock', 'expired', 'discontinued') NULL DEFAULT 'available',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_medication_facility_id` (`facility_id`)
,  CONSTRAINT `fk_medication_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Patient
CREATE TABLE IF NOT EXISTS `patient` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `blood_type` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
  `emergency_contact_name` VARCHAR(255) NULL,
  `emergency_contact_phone` VARCHAR(255) NULL,
  `insurance_provider` VARCHAR(255) NULL,
  `insurance_number` VARCHAR(255) NULL,
  `allergies` TEXT NULL,
  `status` ENUM('active', 'admitted', 'discharged', 'deceased') NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_patient_facility_id` (`facility_id`)
,  CONSTRAINT `fk_patient_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- PatientMessage
CREATE TABLE IF NOT EXISTS `patient_message` (
  `id` VARCHAR(64) NOT NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `patient_email` VARCHAR(255) NULL,
  `doctor_name` VARCHAR(255) NULL,
  `subject` VARCHAR(255) NULL,
  `message` TEXT NOT NULL,
  `reply` TEXT NULL,
  `direction` ENUM('patient_to_doctor', 'doctor_to_patient') NULL DEFAULT 'patient_to_doctor',
  `status` ENUM('unread', 'read', 'replied') NULL DEFAULT 'unread',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_patient_message_patient_id` (`patient_id`)
,  CONSTRAINT `fk_patient_message_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Prescription
CREATE TABLE IF NOT EXISTS `prescription` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `doctor_name` VARCHAR(255) NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(255) NULL,
  `frequency` VARCHAR(255) NULL,
  `duration` VARCHAR(255) NULL,
  `quantity` INT NULL,
  `instructions` TEXT NULL,
  `prescribed_date` DATE NULL,
  `dispensed_date` DATE NULL,
  `dispensed_by` VARCHAR(255) NULL,
  `total_cost` DECIMAL(12,2) NULL,
  `status` ENUM('pending', 'dispensed', 'partially_dispensed', 'cancelled') NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_prescription_facility_id` (`facility_id`),
  KEY `idx_prescription_patient_id` (`patient_id`)
,  CONSTRAINT `fk_prescription_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_prescription_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- SystemRole
CREATE TABLE IF NOT EXISTS `system_role` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL,
  `permissions` JSON NULL,
  `color` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- VitalsRecord
CREATE TABLE IF NOT EXISTS `vitals_record` (
  `id` VARCHAR(64) NOT NULL,
  `facility_id` VARCHAR(64) NULL,
  `admission_id` VARCHAR(64) NULL,
  `patient_id` VARCHAR(64) NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `recorded_by` VARCHAR(255) NULL,
  `recorded_date` DATE NOT NULL,
  `recorded_time` VARCHAR(255) NULL,
  `temperature` VARCHAR(255) NULL,
  `blood_pressure` VARCHAR(255) NULL,
  `pulse_rate` VARCHAR(255) NULL,
  `respiratory_rate` VARCHAR(255) NULL,
  `oxygen_saturation` VARCHAR(255) NULL,
  `weight` VARCHAR(255) NULL,
  `blood_glucose` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
,  KEY `idx_vitals_record_facility_id` (`facility_id`),
  KEY `idx_vitals_record_admission_id` (`admission_id`),
  KEY `idx_vitals_record_patient_id` (`patient_id`)
,  CONSTRAINT `fk_vitals_record_facility_id` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_vitals_record_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
