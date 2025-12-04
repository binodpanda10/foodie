import db from '../config/db.config.js';

// Create a new restaurant
export const createRestaurant = async (req, res) => {
    const { owner_id, name, description, latitude, longitude } = req.body;
    try {
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: "Invalid latitude or longitude." });
        }

        // Construct the photo URL from the uploaded file
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

        const query = "INSERT INTO restaurants (owner_id, name, description, latitude, longitude, photo_url) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.execute(query, [owner_id, name, description, latitude, longitude, photo_url]);
        res.status(201).json({ success: true, message: "Restaurant created successfully.", restaurant_id: result.insertId });
    } catch (error) {
        console.error("Error creating restaurant:", error);
        res.status(500).json({ success: false, message: "Error creating restaurant.", error: error.message });
    }
};

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const [restaurant] = await db.execute("SELECT restaurant_id, owner_id, name, description, latitude, longitude, photo_url FROM restaurants WHERE restaurant_id = ?", [restaurantId]);
        if (restaurant.length === 0) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }
        res.status(200).json({ success: true, data: restaurant[0] });
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({ success: false, message: "Error fetching restaurant.", error: error.message });
    }
};

// Update restaurant details
export const updateRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    const { name, description, latitude, longitude } = req.body;
    try {
        const query = "UPDATE restaurants SET name = ?, description = ?, latitude = ?, longitude = ? WHERE restaurant_id = ?";
        const [result] = await db.execute(query, [name, description, latitude, longitude, restaurantId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Restaurant not found or no changes made." });
        }
        res.status(200).json({ success: true, message: "Restaurant updated successfully." });
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ success: false, message: "Error updating restaurant.", error: error.message });
    }
};

// Delete restaurant (will cascade delete associated foods)
export const deleteRestaurant = async (req, res) => {
    const { restaurantId } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM restaurants WHERE restaurant_id = ?", [restaurantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }
        res.status(200).json({ success: true, message: "Restaurant deleted successfully (and associated foods)." });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ success: false, message: "Error deleting restaurant.", error: error.message });
    }
};

// *** ALGORITHM 1: Geospatial Search and Sorting Algorithm ***
export const getNearbyRestaurants = async (req, res) => {
    const { lat, lng, radius } = req.query; // User's location and search radius (in km)

    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: "Latitude (lat) and Longitude (lng) are required." });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = radius ? parseFloat(radius) : 10; // Default to 10 km

    try {
        // Uses MySQL's ST_Distance_Sphere which calculates distance in meters.
        const query = `
            SELECT 
                restaurant_id, 
                name, 
                description, 
                latitude, 
                longitude, 
                photo_url,
                -- Calculate distance and convert from meters to kilometers
                (ST_Distance_Sphere(
                    POINT(longitude, latitude),    -- Restaurant coordinates (Lng, Lat order)
                    POINT(?, ?)                    -- User coordinates (Lng, Lat order)
                ) * 0.001) AS distance_km
            FROM 
                restaurants
            HAVING 
                distance_km <= ? 
            ORDER BY 
                distance_km ASC;
        `;
        
        const [results] = await db.execute(query, [userLng, userLat, searchRadius]);

        res.status(200).json({
            success: true,
            user_location: { lat: userLat, lng: userLng, radius: searchRadius + 'km' },
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Error finding nearby restaurants:", error);
        res.status(500).json({ success: false, message: "Server Error during location search. Check if MySQL Spatial functions are enabled." });
    }
};