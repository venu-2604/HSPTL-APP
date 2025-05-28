-- SQL script to fix any issues with the patient registration endpoint

-- 1. Ensure the photo column type is BYTEA (not OID)
DO $$
DECLARE
    col_type TEXT;
BEGIN
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'photo';
    
    RAISE NOTICE 'Current photo column type: %', col_type;
    
    -- If column is oid type, alter it to bytea
    IF col_type = 'oid' THEN
        RAISE NOTICE 'Changing photo column type from OID to BYTEA...';
        EXECUTE 'ALTER TABLE patients ALTER COLUMN photo TYPE BYTEA USING NULL';
        RAISE NOTICE 'Column type changed successfully';
    ELSE
        RAISE NOTICE 'Column type is already %, no change needed', col_type;
    END IF;
END $$;

-- 2. Check if all required constraints exist
DO $$
DECLARE
    aadhar_constraint_count INTEGER;
BEGIN
    -- Check if aadhar_number has a unique constraint
    SELECT COUNT(*) INTO aadhar_constraint_count
    FROM pg_constraint
    WHERE conrelid = 'patients'::regclass::oid
      AND contype = 'u'
      AND array_to_string(conkey, ',') IN (
          SELECT array_to_string(ARRAY[attnum], ',')
          FROM pg_attribute
          WHERE attrelid = 'patients'::regclass
            AND attname = 'aadhar_number'
      );
      
    IF aadhar_constraint_count > 0 THEN
        RAISE NOTICE 'Aadhar number unique constraint exists';
    ELSE
        RAISE NOTICE 'Adding unique constraint on aadhar_number';
        EXECUTE 'ALTER TABLE patients ADD CONSTRAINT patients_aadhar_number_unique UNIQUE (aadhar_number)';
    END IF;
END $$;

-- 3. Verify the visits table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visits'
ORDER BY ordinal_position;

-- 4. List all columns in the patients table to verify
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- SQL fix for patient registration and photo field
-- Ensuring the photo field properly accepts binary data

-- Check if patients table exists and create if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patients') THEN
        CREATE TABLE public.patients (
            patient_id VARCHAR(10) PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            father_name VARCHAR(50),
            gender VARCHAR(10) NOT NULL,
            age INTEGER NOT NULL,
            address TEXT,
            blood_group VARCHAR(5),
            phone_number VARCHAR(15),
            aadhar_number VARCHAR(12),
            photo BYTEA,
            total_visits INTEGER DEFAULT 0
        );
    END IF;
END $$;

-- Update the patients table if it exists but has incorrect photo field type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' 
        AND column_name = 'photo' 
        AND data_type != 'bytea'
    ) THEN
        -- Alter the photo column to be BYTEA type
        ALTER TABLE patients ALTER COLUMN photo TYPE BYTEA USING photo::bytea;
    END IF;
END $$;

-- Add any missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'total_visits') THEN
        ALTER TABLE patients ADD COLUMN total_visits INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create an index on patient_id for faster lookups
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'patients' 
        AND indexname = 'idx_patient_id'
    ) THEN
        CREATE INDEX idx_patient_id ON patients(patient_id);
    END IF;
END $$;

-- Create or replace a function to handle patient registration
CREATE OR REPLACE FUNCTION register_patient(
    p_patient_id VARCHAR(10),
    p_name VARCHAR(50),
    p_surname VARCHAR(50),
    p_father_name VARCHAR(50),
    p_gender VARCHAR(10),
    p_age INTEGER,
    p_address TEXT,
    p_blood_group VARCHAR(5),
    p_phone_number VARCHAR(15),
    p_aadhar_number VARCHAR(12),
    p_photo BYTEA
) RETURNS VARCHAR AS $$
DECLARE
    result VARCHAR;
BEGIN
    -- Check if patient already exists
    IF EXISTS (SELECT 1 FROM patients WHERE patient_id = p_patient_id) THEN
        RETURN 'Patient with this ID already exists';
    END IF;
    
    -- Insert the new patient
    INSERT INTO patients (
        patient_id, name, surname, father_name, gender, age, 
        address, blood_group, phone_number, aadhar_number, photo, total_visits
    ) VALUES (
        p_patient_id, p_name, p_surname, p_father_name, p_gender, p_age,
        p_address, p_blood_group, p_phone_number, p_aadhar_number, p_photo, 0
    );
    
    RETURN 'Patient registered successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql; 