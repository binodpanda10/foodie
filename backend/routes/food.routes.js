// const express = require('express');
// const router = express.Router();
// const foodController = require('../controllers/food.controller');

// // Base route: /api/foods

// // POST: Create a new food item
// router.post('/', foodController.createFood);

// // GET: Retrieve a single food item by ID
// router.get('/:foodId', foodController.getFoodById);

// // PUT: Update a food item's details
// router.put('/:foodId', foodController.updateFood);

// // DELETE: Delete a food item
// router.delete('/:foodId', foodController.deleteFood);

// // GET: *** ALGORITHM 2 IMPLEMENTATION *** Get foods for a restaurant filtered by budget
// // Example: GET /api/foods/restaurant/1/budget?budget=Affordable
// router.get('/restaurant/:restaurantId/budget', foodController.getFoodsByBudget);

// // GET: *** ALGORITHM 3 IMPLEMENTATION *** Get complementary foods for a main dish
// // Example: GET /api/foods/101/complementary (Suggests items that complement food_id 101)
// router.get('/:foodId/complementary', foodController.getComplementaryFoods);

// module.exports = router;




import express from 'express';
const router = express.Router();
import * as foodController from '../controllers/food.controller.js';

// Base route: /api/foods

router.post('/', foodController.createFood);
router.get('/:foodId', foodController.getFoodById);
router.put('/:foodId', foodController.updateFood);
router.delete('/:foodId', foodController.deleteFood);

// GET: *** ALGORITHM 2 IMPLEMENTATION *** 
router.get('/restaurant/:restaurantId/budget', foodController.getFoodsByBudget);

// GET: *** ALGORITHM 3 IMPLEMENTATION *** 
router.get('/:foodId/complementary', foodController.getComplementaryFoods);

export default router;