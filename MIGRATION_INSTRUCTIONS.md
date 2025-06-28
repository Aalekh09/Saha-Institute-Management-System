# Database Migration Instructions

## Adding Father's Name to Enquiries

This migration adds a `father_name` field to the enquiries table to store the father's name of the person making the enquiry.

### Prerequisites
- MySQL database running
- Access to the `studentdb_2` database
- MySQL client or workbench

### Steps to Apply Migration

1. **Stop the Spring Boot application** if it's running

2. **Connect to MySQL database**:
   ```bash
   mysql -u root -p
   ```

3. **Run the migration script**:
   ```sql
   USE studentdb_2;
   ALTER TABLE enquiries ADD COLUMN father_name VARCHAR(255) AFTER name;
   ```

4. **Verify the migration**:
   ```sql
   DESCRIBE enquiries;
   ```
   You should see the `father_name` column in the table structure.

5. **Restart the Spring Boot application**

### Alternative: Using the provided script

You can also run the provided `mysql_migration.sql` file:

```bash
mysql -u root -p < mysql_migration.sql
```

### What Changed

1. **Backend Changes**:
   - Added `fatherName` field to `Enquiry.java` model
   - Updated getters and setters for the new field

2. **Frontend Changes**:
   - Added father's name input field to the enquiry form
   - Updated the enquiry list table to display father's name
   - Updated search functionality to include father's name
   - Updated React components (EnquiryForm.js and EnquiryList.js)

3. **Database Changes**:
   - Added `father_name` column to `enquiries` table

### Testing

After applying the migration:

1. Start the application
2. Navigate to the Enquiry page
3. Try creating a new enquiry with father's name
4. Verify the father's name appears in the enquiry list
5. Test the search functionality with father's name
6. Test converting an enquiry to student (father's name should transfer)

### Rollback (if needed)

If you need to rollback the changes:

```sql
USE studentdb_2;
ALTER TABLE enquiries DROP COLUMN father_name;
```

**Note**: This will permanently delete the father's name data for all enquiries. 