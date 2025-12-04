import db from '../config/db.config.js';

// Get all food items from all restaurants
export const getAllFoods = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.*, 
                r.name as restaurant_name
            FROM foods f
            JOIN restaurants r ON f.restaurant_id = r.restaurant_id
            ORDER BY r.name, f.name;
        `;
        const [foods] = await db.execute(query);
        res.status(200).json({ success: true, count: foods.length, foods: foods });
    } catch (error) {
        console.error("Error fetching all food items:", error);
        res.status(500).json({ success: false, message: "Error fetching all food items.", error: error.message });
    }
};