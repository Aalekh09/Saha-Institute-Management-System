-- Database Migration Script
-- Add father_name column to enquiries table

-- For MySQL/MariaDB
ALTER TABLE enquiries ADD COLUMN father_name VARCHAR(255);

-- For PostgreSQL
-- ALTER TABLE enquiries ADD COLUMN father_name VARCHAR(255);

-- For H2 (if using H2 database)
-- ALTER TABLE enquiries ADD COLUMN father_name VARCHAR(255);

-- Update existing records to have a default value (optional)
-- UPDATE enquiries SET father_name = 'Not Specified' WHERE father_name IS NULL; 