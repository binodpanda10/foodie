// --- DB CONFIGURATION (Using process.env for security) ---

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    // Use environment variables for production security
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME, 
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;