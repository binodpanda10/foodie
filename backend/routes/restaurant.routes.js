import express from 'express';
const router = express.Router();
import * as restaurantController from '../controllers/restaurant.controller.js';
import upload from '../middleware/upload.js';

// Import the food router to handle nested routes
import foodRouter from './food.routes.js';

// Base route: /api/restaurants

router.get('/nearby', restaurantController.getNearbyRestaurants);
router.post('/', upload, restaurantController.createRestaurant);
router.use('/:restaurantId/foods', foodRouter); // Redirect requests for /:restaurantId/foods to the food router
router.get('/:restaurantId', restaurantController.getRestaurantById);
router.put('/:restaurantId', restaurantController.updateRestaurant);
router.delete('/:restaurantId', restaurantController.deleteRestaurant);

export default router;