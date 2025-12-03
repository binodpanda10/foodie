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
        // Join with the restaurants table to include the restaurant's name
        const query = `
            SELECT 
                f.*, 
                r.name AS restaurant_name 
            FROM foods f
            JOIN restaurants r ON f.restaurant_id = r.restaurant_id
            WHERE f.food_id = ?
        `;
        const [food] = await db.execute(query, [foodId]);
        if (food.length === 0) {
            return res.status(404).json({ success: false, message: "Food item not found." });
        }
        res.status(200).json({ success: true, data: food[0] });
    } catch (error) {
        console.error("Error fetching food item:", error);
        res.status(500).json({ success: false, message: "Error fetching food item.", error: error.message });
    }
};

// Get all food items for a specific restaurant
export const getFoodsByRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const query = "SELECT * FROM foods WHERE restaurant_id = ?";
        const [foods] = await db.execute(query, [restaurantId]);
        // Use a consistent response format
        res.status(200).json({ success: true, count: foods.length, foods: foods });
    } catch (error) {
        console.error("Error fetching food items for restaurant:", error);
        res.status(500).json({ success: false, message: "Error fetching food items.", error: error.message });
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

// *** ALGORITHM 4: Item-Based Collaborative Filtering for Complementary Foods ***
export const getCollaborativeSuggestions = async (req, res) => {
    const { foodId } = req.params;

    try {
        // This query finds other food items that are frequently paired in the `complementary_foods` table
        // with the items that the current `foodId` is paired with.
        // It's a way of saying "what other items are popular alongside the items that go well with your choice?"
        const query = `
            SELECT 
                f.food_id, 
                f.name, 
                f.description, 
                f.price,
                COUNT(f.food_id) AS suggestion_score
            FROM 
                complementary_foods cf1
            JOIN 
                complementary_foods cf2 ON cf1.food_id = cf2.food_id AND cf1.complementary_food_id != cf2.complementary_food_id
            JOIN 
                foods f ON cf2.complementary_food_id = f.food_id
            WHERE 
                cf1.complementary_food_id = ?
            GROUP BY 
                f.food_id, f.name, f.description, f.price
            ORDER BY 
                suggestion_score DESC
            LIMIT 5; -- Limit to the top 5 suggestions
        `;

        const [results] = await db.execute(query, [foodId]);

        res.status(200).json({ success: true, message: `Collaborative filtering suggestions for food ID ${foodId}`, data: results });
    } catch (error) {
        console.error("Error fetching collaborative suggestions:", error);
        res.status(500).json({ success: false, message: "Server Error during collaborative filtering." });
    }
};

// *** ALGORITHM 5: User-Based Collaborative Filtering ***
export const getPersonalizedSuggestions = async (req, res) => {
    const { customerId } = req.params;
    const minRating = 4; // Consider ratings of 4 or 5 as "liked"

    try {
        // This query implements user-based collaborative filtering.
        // 1. Find all foods the target customer has rated highly (`target_user_likes`).
        // 2. Find other customers who also rated those same foods highly (`similar_users`).
        // 3. Find what other foods those similar users liked.
        // 4. Exclude foods the target user has already rated.
        // 5. Rank suggestions by how many similar users liked them.
        const query = `
            SELECT
                f.food_id,
                f.name,
                f.description,
                f.price,
                COUNT(f.food_id) AS suggestion_score,
                AVG(fr.rating) AS average_rating
            FROM
                food_ratings fr
            JOIN
                foods f ON fr.food_id = f.food_id
            WHERE
                -- Find items liked by users with similar tastes
                fr.customer_id IN (
                    SELECT DISTINCT fr2.customer_id
                    FROM food_ratings fr1
                    JOIN food_ratings fr2 ON fr1.food_id = fr2.food_id AND fr1.customer_id != fr2.customer_id
                    WHERE fr1.customer_id = ? AND fr1.rating >= ?
                )
                -- Only recommend items that similar users rated highly
                AND fr.rating >= ?
                -- Exclude items the target user has already rated
                AND fr.food_id NOT IN (
                    SELECT food_id FROM food_ratings WHERE customer_id = ?
                )
            GROUP BY
                f.food_id, f.name, f.description, f.price
            ORDER BY
                suggestion_score DESC, average_rating DESC
            LIMIT 10;
        `;

        const [results] = await db.execute(query, [customerId, minRating, minRating, customerId]);

        res.status(200).json({
            success: true,
            message: `Personalized suggestions for customer ID ${customerId}`,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Error fetching personalized suggestions:", error);
        res.status(500).json({ success: false, message: "Server Error during personalized recommendation." });
    }
};