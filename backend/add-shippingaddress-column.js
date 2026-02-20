import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const addShippingAddressColumn = async () => {
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

    // Check if shippingAddress column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'eShops' 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'shippingAddress'
    `);

    if (columns.length === 0) {
      // Add the shippingAddress column
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN shippingAddress JSON AFTER paymentMethod
      `);
      console.log('Added shippingAddress column to orders table');
    } else {
      console.log('shippingAddress column already exists');
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

addShippingAddressColumn();