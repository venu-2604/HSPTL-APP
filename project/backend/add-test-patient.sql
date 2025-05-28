-- Add a test patient directly into the database
-- First check if the patient with this Aadhar already exists

DO $$
DECLARE
    existing_count INTEGER;
    gen_id TEXT;
BEGIN
    -- Check for existing patient with this Aadhar
    SELECT COUNT(*) INTO existing_count 
    FROM patients 
    WHERE aadhar_number = '987612345699';
    
    IF existing_count > 0 THEN
        RAISE NOTICE 'Patient with Aadhar 987612345699 already exists. Skipping insertion.';
    ELSE
        -- Generate a random ID for the patient
        gen_id := 'P' || substr(md5(random()::text), 1, 9);
        
        -- Insert the patient
        INSERT INTO patients (
            patient_id, 
            name, 
            surname, 
            father_name, 
            gender, 
            age, 
            address, 
            blood_group, 
            phone_number, 
            aadhar_number, 
            photo, 
            total_visits
        ) VALUES (
            gen_id,
            'Sophia',
            'Anderson',
            'James',
            'Female',
            31,
            '567 Willow Drive, Seattle',
            'O-',
            '1234567890',
            '987612345699',
            NULL,
            0
        );
        
        RAISE NOTICE 'Successfully inserted patient with ID: %', gen_id;
    END IF;
END $$;

-- List all patients to verify the insertion
SELECT patient_id, name, surname, gender, age, aadhar_number, blood_group
FROM patients
ORDER BY patient_id; 