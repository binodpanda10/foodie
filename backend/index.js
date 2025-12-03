import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet'; // Import helmet
import cors from 'cors';     // Import cors

// Require the mock DB config
import db from './config/db.config.js'; 

// Import the route files (must include .js extension in ESM)
import ownerRoutes from './routes/owner.routes.js';
import customerRoutes from './routes/customer.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import foodRoutes from './routes/food.routes.js';

const app = express();
// Use port from environment variable, default to 3000
const PORT = process.env.PORT || 3000; 

// --- Security Middleware Setup ---
app.use(helmet());
app.use(cors());

// --- Body Parsing Middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Test Database Connection ---
db.getConnection()
    .then(connection => {
        console.log("Successfully connected to the MySQL database!");
        connection.release();
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
        console.error("HINT: Ensure your config/db.config.js and .env file are correctly set up.");
    });


// --- Route Definitions ---

// General status route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: "Welcome to the Foodie Recommendation API!",
    });
});

// Mount the specific API routes
app.use('/api/owners', ownerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);


// Start the server
app.listen(PORT, () => {
    // You can now access environment variables like DB_USER
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}.`);
});