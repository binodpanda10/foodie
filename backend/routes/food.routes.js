import express from 'express';
import * as foodController from '../controllers/food.controller.js';

// By setting mergeParams: true, this router can access params from its parent router (e.g., :restaurantId)
const router = express.Router({ mergeParams: true });

// Base route for this router will be something like /api/restaurants/:restaurantId/foods

// GET /api/restaurants/:restaurantId/foods
router.get('/', foodController.getFoodsByRestaurant);

// POST /api/foods (This will be handled by the main food router in index.js)
router.post('/', foodController.createFood);
router.get('/:foodId', foodController.getFoodById);
router.put('/:foodId', foodController.updateFood);
router.delete('/:foodId', foodController.deleteFood);

export default router;