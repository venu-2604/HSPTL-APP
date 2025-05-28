-- Rename current_condition column to symptoms in visits table
ALTER TABLE visits RENAME COLUMN current_condition TO symptoms; 