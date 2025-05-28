-- SQL script to fix the photo column type in the patients table
-- Check the current column type
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

-- List all columns in the patients table to verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position; 