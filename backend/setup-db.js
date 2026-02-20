import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const setupDatabase = async () => {
  let connection;
  
  try {
    // Create connection without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
    });

    console.log('Connected to MySQL server');

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS eShops;');
    console.log('Database eShops created or already exists');

    // Use the database
    await connection.query('USE eShops;');

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements and execute them one by one
    // Remove the first two lines (CREATE DATABASE and USE) since we already executed them
    const lines = schemaSQL.split('\n');
    const schemaWithoutDbCommands = lines.slice(2).join('\n');
    
    // Split by semicolon to get individual statements
    const statements = schemaWithoutDbCommands
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
        console.log(`Executed: ${statement.substring(0, 60)}...`);
      }
    }

    console.log('All tables created successfully');

  } catch (error) {
    console.error('Error setting up database:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed');
    }
  }
};

setupDatabase();