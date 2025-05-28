-- Fix script for photo column type issue
-- This script addresses the "ERROR: column \"photo\" is of type bytea but expression is of type bigint\n"

-- Drop the patients table if it exists and recreate with proper column types
DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS patients;

-- Create patients table with correct column types
CREATE TABLE patients (
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
    photo VARCHAR(255) DEFAULT NULL,
    total_visits INTEGER DEFAULT 0
);

-- Create visits table with proper foreign key
CREATE TABLE visits (
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
    patient_id VARCHAR(50) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_patients_aadhar_number ON patients(aadhar_number);
CREATE INDEX idx_visits_patient_id ON visits(patient_id); 