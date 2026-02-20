import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const addStatusColumn = async () => {
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

    // Check if status column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'eShops' 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'status'
    `);

    if (columns.length === 0) {
      // Add the status column
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN status VARCHAR(50) DEFAULT 'Pending' AFTER totalPrice
      `);
      console.log('Added status column to orders table');
      
      // Update existing orders to have a status
      await connection.query(`
        UPDATE orders 
        SET status = 'Pending' 
        WHERE status IS NULL OR status = ''
      `);
      console.log('Updated existing orders with default status');
    } else {
      console.log('Status column already exists');
    }

    console.log('Database update completed successfully');

  } catch (error) {
    console.error('Error updating database:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
};

addStatusColumn();