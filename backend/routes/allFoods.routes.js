import express from 'express';
import * as allFoodsController from '../controllers/allFoods.controller.js';
import * as foodController from '../controllers/food.controller.js';

const router = express.Router();

// General routes
router.get('/', allFoodsController.getAllFoods);

// Algorithm routes
router.get('/personalized/:customerId', foodController.getPersonalizedSuggestions);
router.get('/:foodId/complementary', foodController.getComplementaryFoods);
router.get('/:foodId/collaborative', foodController.getCollaborativeSuggestions);


export default router;