-- MySQL Migration Script for Student Management System
-- Add father_name column to enquiries table

USE studentdb_2;

-- Add father_name column to enquiries table
ALTER TABLE enquiries ADD COLUMN father_name VARCHAR(255) AFTER name;

-- Optional: Update existing records to have a default value
-- UPDATE enquiries SET father_name = 'Not Specified' WHERE father_name IS NULL;

-- Verify the column was added
DESCRIBE enquiries; 