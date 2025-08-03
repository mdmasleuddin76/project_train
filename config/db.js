// config/db.js
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // Add your DB password in .env
    database: process.env.DB_DATABASE, // Add your DB name in .env
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Pool connected successfully.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(error => {
        console.error('❌ Failed to connect to MySQL Pool:', error.message);
        // Exit process with failure
        process.exit(1);
    });

export default pool;