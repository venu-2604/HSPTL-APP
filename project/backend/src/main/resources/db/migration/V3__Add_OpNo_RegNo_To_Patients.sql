-- Update existing patients with generated OP and REG numbers
UPDATE patients 
SET op_no = CONCAT('OP', patient_id),
    reg_no = CONCAT('REG', patient_id)
WHERE op_no IS NULL OR reg_no IS NULL; 