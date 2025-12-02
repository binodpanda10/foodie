import db from '../config/db.config.js';

// Create a new food item
export const createFood = async (req, res) => {
    const { restaurant_id, name, description, price, budget_category, is_vegetarian, is_vegan } = req.body;
    try {
        if (!['Affordable', 'Mid-Range', 'Premium'].includes(budget_category)) {
            return res.status(400).json({ success: false, message: "Invalid budget category." });
        }
        
        const query = `
            INSERT INTO foods (restaurant_id, name, description, price, budget_category, is_vegetarian, is_vegan) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [restaurant_id, name, description, price, budget_category, is_vegetarian, is_vegan]);
        res.status(201).json({ success: true, message: "Food item created successfully.", food_id: result.insertId });
    } catch (error) {
        console.error("Error creating food item:", error);
        res.status(500).json({ success: false, message: "Error creating food item.", error: error.message });
    }
};

// Get food item by ID
export const getFoodById = async (req, res) => {
    const { foodId } = req.params;
    try {
        const [food] = await db.execute("SELECT * FROM foods WHERE food_id = ?", [foodId]);
        if (food.length === 0) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }
        res.status(200).json({ success: true, data: food[0] });
    } catch (error) {
        console.error("Error fetching food item:", error);
        res.status(500).json({ success: false, message: "Error fetching food item.", error: error.message });
    }
};

// Update food item details
export const updateFood = async (req, res) => {
    const { foodId } = req.params;
    const { name, description, price, budget_category, is_vegetarian, is_vegan } = req.body;
    try {
        const query = `
            UPDATE foods 
            SET name = ?, description = ?, price = ?, budget_category = ?, is_vegetarian = ?, is_vegan = ? 
            WHERE food_id = ?
        `;
        const [result] = await db.execute(query, [name, description, price, budget_category, is_vegetarian, is_vegan, foodId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Food item not found or no changes made." });
        }
        res.status(200).json({ success: true, message: "Food item updated successfully." });
    } catch (error) {
        console.error("Error updating food item:", error);
        res.status(500).json({ success: false, message: "Error updating food item.", error: error.message });
    }
};

// Delete food item (cascades to complementary_foods pairings)
export const deleteFood = async (req, res) => {
    const { foodId } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM foods WHERE food_id = ?", [foodId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }
        res.status(200).json({ success: true, message: "Food item deleted successfully." });
    } catch (error) {
        console.error("Error deleting food item:", error);
        res.status(500).json({ success: false, message: "Error deleting food item.", error: error.message });
    }
};


// *** ALGORITHM 2: Budget-Based Recommendation Algorithm ***
export const getFoodsByBudget = async (req, res) => {
    const { restaurantId } = req.params;
    const { budget } = req.query; // e.g., 'Affordable', 'Mid-Range', 'Premium'

    if (!budget || !['Affordable', 'Mid-Range', 'Premium'].includes(budget)) {
        return res.status(400).json({ success: false, message: "Valid budget parameter ('Affordable', 'Mid-Range', 'Premium') is required." });
    }

    try {
        const query = "SELECT food_id, name, price, description FROM foods WHERE restaurant_id = ? AND budget_category = ? ORDER BY price ASC";
        const [results] = await db.execute(query, [restaurantId, budget]);

        res.status(200).json({
            success: true,
            count: results.length,
            budget_filter: budget,
            data: results
        });

    } catch (error) {
        console.error("Error fetching foods by budget:", error);
        res.status(500).json({ success: false, message: "Server Error during budget search." });
    }
};


// *** ALGORITHM 3: Complementary Food Recommendation Algorithm ***
export const getComplementaryFoods = async (req, res) => {
    const { foodId } = req.params; // The ID of the main food item (e.g., Pizza)

    try {
        const query = `
            SELECT
                f2.food_id,
                f2.name,
                f2.description,
                f2.price,
                f2.budget_category
            FROM
                complementary_foods cf
            INNER JOIN
                foods f2 ON cf.complementary_food_id = f2.food_id
            WHERE
                cf.food_id = ?;
        `;
        
        const [results] = await db.execute(query, [foodId]);

        res.status(200).json({
            success: true,
            count: results.length,
            message: `Complementary suggestions for food ID ${foodId}`,
            data: results
        });

    } catch (error) {
        console.error("Error fetching complementary foods:", error);
        res.status(500).json({ success: false, message: "Server Error during complementary search." });
    }
};