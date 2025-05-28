-- Fix script for patient registration endpoint
-- Run this script to fix database issues related to patient registration

-- 1. Make sure all required tables exist
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    gender VARCHAR(20),
    age INTEGER,
    address TEXT,
    blood_group VARCHAR(10),
    phone_number VARCHAR(20),
    aadhar_number VARCHAR(20) UNIQUE,
    photo BYTEA,
    total_visits INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visits (
    visit_id SERIAL PRIMARY KEY,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bp TEXT,
    complaint TEXT,
    symptoms TEXT,
    op_no TEXT,
    reg_no VARCHAR(50),
    status VARCHAR(20),
    temperature VARCHAR(20),
    weight VARCHAR(20),
    prescription TEXT,
    patient_id VARCHAR(50) REFERENCES patients(patient_id)
);

-- 2. Fix potential schema issues

-- Ensure photo column is BYTEA type
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'photo' AND data_type <> 'bytea'
  ) THEN
    ALTER TABLE patients ALTER COLUMN photo TYPE BYTEA;
  END IF;
END $$;

-- Ensure aadhar_number has unique constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'patients_aadhar_number_key' AND conrelid = 'patients'::regclass
  ) THEN
    ALTER TABLE patients ADD CONSTRAINT patients_aadhar_number_key UNIQUE (aadhar_number);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_aadhar_number ON patients(aadhar_number);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);

-- 3. Add proper foreign key constraint if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_visits_patient_id' AND conrelid = 'visits'::regclass
  ) THEN
    ALTER TABLE visits 
    ADD CONSTRAINT fk_visits_patient_id 
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Verify the schema
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('patients', 'visits')
ORDER BY table_name, ordinal_position;

-- 5. Report counts for diagnostics
SELECT 'patients' as table_name, COUNT(*) as row_count FROM patients
UNION ALL
SELECT 'visits' as table_name, COUNT(*) as row_count FROM visits; 