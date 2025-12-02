// --- DB CONFIGURATION (Using process.env for security) ---

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables if not already loaded (safe practice)
dotenv.config();

const pool = mysql.createPool({
    // Use environment variables for production security
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'foodie', 
    password: process.env.DB_PASSWORD || 'root',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;