import db from '../config/db.config.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// Create a new customer
export const createCustomer = async (req, res) => {
    const { first_name, last_name, email, password, phone_number, current_latitude, current_longitude, preferred_budget_category } = req.body;
    try {
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required." });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO customers (first_name, last_name, email, password, phone_number, current_latitude, current_longitude, preferred_budget_category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [first_name, last_name, email, hashedPassword, phone_number, current_latitude, current_longitude, preferred_budget_category]);
        res.status(201).json({ success: true, message: "Customer registered successfully.", customer_id: result.insertId });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ success: false, message: "Error creating customer.", error: error.message });
    }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
    const { customerId } = req.params;
    try {
        // Exclude password from the result
        const [customer] = await db.execute("SELECT customer_id, first_name, last_name, email, phone_number, current_latitude, current_longitude, preferred_budget_category FROM customers WHERE customer_id = ?", [customerId]);
        if (customer.length === 0) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }
        res.status(200).json({ success: true, data: customer[0] });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ success: false, message: "Error fetching customer.", error: error.message });
    }
};

// Update customer details and location
export const updateCustomer = async (req, res) => {
    const { customerId } = req.params;
    const { first_name, last_name, phone_number, current_latitude, current_longitude } = req.body;
    try {
        const query = `
            UPDATE customers 
            SET first_name = ?, last_name = ?, phone_number = ?, current_latitude = ?, current_longitude = ? 
            WHERE customer_id = ?
        `;
        const [result] = await db.execute(query, [first_name, last_name, phone_number, current_latitude, current_longitude, customerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Customer not found or no changes made." });
        }
        res.status(200).json({ success: true, message: "Customer updated successfully." });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({ success: false, message: "Error updating customer.", error: error.message });
    }
};

// *** ALGORITHM 2 SUPPORT: Update Budget Preference ***
export const updateBudgetPreference = async (req, res) => {
    const { customerId } = req.params;
    const { preferred_budget_category } = req.body; 

    if (!['Affordable', 'Mid-Range', 'Premium'].includes(preferred_budget_category)) {
        return res.status(400).json({ success: false, message: "Invalid budget category. Must be 'Affordable', 'Mid-Range', or 'Premium'." });
    }

    try {
        const query = "UPDATE customers SET preferred_budget_category = ? WHERE customer_id = ?";
        const [result] = await db.execute(query, [preferred_budget_category, customerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }
        res.status(200).json({ success: true, message: "Budget preference updated successfully." });
    } catch (error) {
        console.error("Error updating budget preference:", error);
        res.status(500).json({ success: false, message: "Error updating budget preference.", error: error.message });
    }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
    const { customerId } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM customers WHERE customer_id = ?", [customerId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }
        res.status(200).json({ success: true, message: "Customer deleted successfully." });
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ success: false, message: "Error deleting customer.", error: error.message });
    }
};

// Login customer
export const loginCustomer = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        // Find the customer by email, including the password for comparison
        const [customer] = await db.execute("SELECT * FROM customers WHERE email = ?", [email]);

        if (customer.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const storedCustomer = customer[0];
        const passwordMatch = await bcrypt.compare(password, storedCustomer.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        res.status(200).json({ success: true, message: "Login successful.", customer_id: storedCustomer.customer_id });
    } catch (error) {
        console.error("Error during customer login:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
};