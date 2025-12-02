import db from '../config/db.config.js';

// Create a new owner
export const createOwner = async (req, res) => {
    const { first_name, last_name, email, phone_number } = req.body;
    try {
        const query = "INSERT INTO owners (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)";
        const [result] = await db.execute(query, [first_name, last_name, email, phone_number]);
        res.status(201).json({ success: true, message: "Owner created successfully.", owner_id: result.insertId });
    } catch (error) {
        console.error("Error creating owner:", error);
        res.status(500).json({ success: false, message: "Error creating owner.", error: error.message });
    }
};

// Get all owners
export const getAllOwners = async (req, res) => {
    try {
        const [owners] = await db.execute("SELECT owner_id, first_name, last_name, email, phone_number FROM owners");
        res.status(200).json({ success: true, count: owners.length, data: owners });
    } catch (error) {
        console.error("Error fetching owners:", error);
        res.status(500).json({ success: false, message: "Error fetching owners.", error: error.message });
    }
};

// Get owner by ID
export const getOwnerById = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const [owner] = await db.execute("SELECT owner_id, first_name, last_name, email, phone_number FROM owners WHERE owner_id = ?", [ownerId]);
        if (owner.length === 0) {
            return res.status(404).json({ success: false, message: "Owner not found." });
        }
        res.status(200).json({ success: true, data: owner[0] });
    } catch (error) {
        console.error("Error fetching owner:", error);
        res.status(500).json({ success: false, message: "Error fetching owner.", error: error.message });
    }
};

// Update owner details
export const updateOwner = async (req, res) => {
    const { ownerId } = req.params;
    const { first_name, last_name, phone_number } = req.body;
    try {
        const query = "UPDATE owners SET first_name = ?, last_name = ?, phone_number = ? WHERE owner_id = ?";
        const [result] = await db.execute(query, [first_name, last_name, phone_number, ownerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Owner not found or no changes made." });
        }
        res.status(200).json({ success: true, message: "Owner updated successfully." });
    } catch (error) {
        console.error("Error updating owner:", error);
        res.status(500).json({ success: false, message: "Error updating owner.", error: error.message });
    }
};

// Delete owner (will cascade delete associated restaurants and foods)
export const deleteOwner = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM owners WHERE owner_id = ?", [ownerId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Owner not found." });
        }
        res.status(200).json({ success: true, message: "Owner deleted successfully (and associated restaurants/foods)." });
    } catch (error) {
        console.error("Error deleting owner:", error);
        res.status(500).json({ success: false, message: "Error deleting owner.", error: error.message });
    }
};