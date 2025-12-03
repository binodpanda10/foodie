
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

// GET: *** ALGORITHM 4 IMPLEMENTATION ***
router.get('/:foodId/collaborative-suggestions', foodController.getCollaborativeSuggestions);

export default router;