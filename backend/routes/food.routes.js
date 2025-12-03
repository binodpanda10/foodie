import express from 'express';
import * as foodController from '../controllers/food.controller.js';

// By setting mergeParams: true, this router can access params from its parent router (e.g., :restaurantId)
const router = express.Router({ mergeParams: true });

// Base route for this router will be something like /api/restaurants/:restaurantId/foods

// GET /api/restaurants/:restaurantId/foods
router.route('/')
    .get(foodController.getFoodsByRestaurant)
    .post(foodController.createFood); // POST /api/restaurants/:restaurantId/foods

// Routes for a specific food item within a restaurant
router.route('/:foodId')
    .get(foodController.getFoodById)
    .put(foodController.updateFood)     // PUT /api/restaurants/:restaurantId/foods/:foodId
    .delete(foodController.deleteFood); // DELETE /api/restaurants/:restaurantId/foods/:foodId

export default router;