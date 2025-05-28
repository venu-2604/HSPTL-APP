-- Patient table
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    gender VARCHAR(255),
    age INT,
    address VARCHAR(255),
    blood_group VARCHAR(255),
    phone_number VARCHAR(255),
    aadhar_number VARCHAR(255) UNIQUE NOT NULL,
    photo VARCHAR(255),
    total_visits INT DEFAULT 0,
    op_no VARCHAR(255) UNIQUE,
    reg_no VARCHAR(255) UNIQUE
);

-- Doctor table
CREATE TABLE IF NOT EXISTS doctor (
    doctor_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'DOCTOR',
    status VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visit table
CREATE TABLE IF NOT EXISTS visits (
    visit_id BIGSERIAL PRIMARY KEY,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bp VARCHAR(255),
    complaint VARCHAR(255),
    symptoms VARCHAR(255),
    op_no VARCHAR(255),
    reg_no VARCHAR(255),
    status VARCHAR(255),
    temperature VARCHAR(255),
    weight VARCHAR(255),
    prescription VARCHAR(255),
    patient_id VARCHAR(255),
    doctor_id VARCHAR(50),
    CONSTRAINT fk_visits_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_visits_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- Lab Test table
CREATE TABLE IF NOT EXISTS labtests (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(255),
    result VARCHAR(255),
    reference_range VARCHAR(255),
    status VARCHAR(255) DEFAULT 'Pending',
    visit_id BIGINT,
    patient_id VARCHAR(255),
    test_given_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result_updated_at TIMESTAMP,
    CONSTRAINT fk_labtests_visit_id FOREIGN KEY (visit_id) REFERENCES visits(visit_id),
    CONSTRAINT fk_labtests_patient_id FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Nurse table
CREATE TABLE IF NOT EXISTS nurse (
    nurse_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'NURSE',
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50)
); 