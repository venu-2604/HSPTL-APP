DELIMITER //

CREATE TRIGGER before_patient_insert
BEFORE INSERT ON patients
FOR EACH ROW
BEGIN
    IF NEW.op_no IS NULL THEN
        SET NEW.op_no = CONCAT('OP', NEW.patient_id);
    END IF;
    
    IF NEW.reg_no IS NULL THEN
        SET NEW.reg_no = CONCAT('REG', NEW.patient_id);
    END IF;
END//

DELIMITER ; 