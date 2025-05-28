CREATE TABLE patients (
    patient_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    gender VARCHAR(50),
    age INTEGER,
    address TEXT,
    blood_group VARCHAR(10),
    phone_number VARCHAR(20),
    aadhar_number VARCHAR(20) UNIQUE NOT NULL,
    photo VARCHAR(255),
    total_visits INTEGER DEFAULT 0,
    op_no VARCHAR(255) UNIQUE,
    reg_no VARCHAR(255) UNIQUE
); 