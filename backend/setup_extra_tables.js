import pool from "./config/db.js";

const setupTables = async () => {
  try {
    console.log("Setting up tables...");

    // Create Contact Us table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contactus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        email VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("ContactUs table checked/created.");

    // Create Privacy Policy table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS privacy_policy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Privacy Policy table checked/created.");

    // Create Inquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        inquiry_type ENUM('Product','Delivery','Price','Other') NOT NULL,
        product_id BIGINT UNSIGNED NULL,
        message TEXT NOT NULL,
        status ENUM('New','Working','Resolved','Completed') DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
        INDEX idx_inquiry_status (status),
        INDEX idx_inquiry_type (inquiry_type)
      )
    `);
    console.log("Inquiries table checked/created.");

    // Create Staff Attendance table (if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status VARCHAR(50),
        notes TEXT,
        working_hours VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_attendance (user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Staff attendance table checked/created.");

    // Add working_hours to staff_attendance if it doesn't exist
    try {
      await pool.query(
        `ALTER TABLE staff_attendance ADD COLUMN working_hours VARCHAR(50)`,
      );
    } catch (e) {
      /* ignore if exists */
    }

    // Create Staff Leaves table
    // DROP TABLE to ensure schema update because we changed it significantly
    await pool.query(`DROP TABLE IF EXISTS staff_leaves`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff_leaves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        leave_name VARCHAR(255) NOT NULL,
        work_handover_to VARCHAR(255),
        start_date DATE NOT NULL,
        from_leave_type VARCHAR(50) NOT NULL, -- e.g., Full Day, First Half, Second Half
        end_date DATE NOT NULL,
        to_leave_type VARCHAR(50) NOT NULL,
        leave_reason TEXT NOT NULL,
        notes TEXT,
        document_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
        approved_by INT,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("Staff leaves table checked/created.");

    // Add columns to contactus if they don't exist (in case table existed with just title/desc)
    try {
      await pool.query(`ALTER TABLE contactus ADD COLUMN email VARCHAR(255)`);
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await pool.query(`ALTER TABLE contactus ADD COLUMN phone VARCHAR(255)`);
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await pool.query(`ALTER TABLE contactus ADD COLUMN address TEXT`);
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await pool.query(
        `ALTER TABLE contactus ADD COLUMN instagram VARCHAR(255)`,
      );
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await pool.query(
        `ALTER TABLE contactus ADD COLUMN facebook VARCHAR(255)`,
      );
    } catch (e) {
      /* ignore if exists */
    }
    try {
      await pool.query(
        `ALTER TABLE contactus ADD COLUMN linkedin VARCHAR(255)`,
      );
    } catch (e) {
      /* ignore if exists */
    }

    console.log("ContactUs columns checked.");

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up tables:", error);
    process.exit(1);
  }
};

setupTables();
