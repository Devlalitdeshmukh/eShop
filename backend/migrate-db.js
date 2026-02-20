import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const migrateDatabase = async () => {
  let connection;
  
  try {
    // Create connection to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: 'eShops'
    });

    console.log('Connected to MySQL database');

    // Check if brand_id and category_id columns exist in products table
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'eShops' 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME IN ('brand_id', 'category_id')
    `);

    console.log(`Found ${columns.length} of the required columns in products table`);

    // Add brand_id column if it doesn't exist
    if (!columns.some(col => col.COLUMN_NAME === 'brand_id')) {
      await connection.query('ALTER TABLE products ADD COLUMN brand_id INT NULL AFTER description');
      console.log('Added brand_id column to products table');
    } else {
      console.log('brand_id column already exists');
    }

    // Add category_id column if it doesn't exist
    if (!columns.some(col => col.COLUMN_NAME === 'category_id')) {
      await connection.query('ALTER TABLE products ADD COLUMN category_id INT NULL AFTER brand_id');
      console.log('Added category_id column to products table');
    } else {
      console.log('category_id column already exists');
    }

    // Add foreign key constraints if they don't exist
    try {
      await connection.query(`
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_brand 
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
      `);
      console.log('Added foreign key constraint for brand_id');
    } catch (fkError) {
      // Foreign key might already exist, that's okay
      if (fkError.message.includes('Duplicate key name') || fkError.message.includes('CONSTRAINT `fk_products_brand` already exists')) {
        console.log('Foreign key constraint for brand_id already exists');
      } else {
        console.log('Foreign key constraint for brand_id may already exist (or other reason):', fkError.message);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      `);
      console.log('Added foreign key constraint for category_id');
    } catch (fkError) {
      // Foreign key might already exist, that's okay
      if (fkError.message.includes('Duplicate key name') || fkError.message.includes('CONSTRAINT `fk_products_category` already exists')) {
        console.log('Foreign key constraint for category_id already exists');
      } else {
        console.log('Foreign key constraint for category_id may already exist (or other reason):', fkError.message);
      }
    }

    // Check if brands and categories tables exist and create them if they don't
    const [brandsTable] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'eShops' 
      AND TABLE_NAME = 'brands'
    `);

    if (brandsTable.length === 0) {
      await connection.query(`
        CREATE TABLE brands (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Created brands table');
    } else {
      console.log('brands table already exists');
    }

    const [categoriesTable] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'eShops' 
      AND TABLE_NAME = 'categories'
    `);

    if (categoriesTable.length === 0) {
      await connection.query(`
        CREATE TABLE categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('Created categories table');
    } else {
      console.log('categories table already exists');
    }

    console.log('Database migration completed successfully');

  } catch (error) {
    console.error('Error during database migration:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
};

migrateDatabase();