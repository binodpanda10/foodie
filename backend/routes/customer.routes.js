import express from 'express';
const router = express.Router();
import * as customerController from '../controllers/customer.controller.js';
import { getPersonalizedSuggestions } from '../controllers/food.controller.js';

// Base route: /api/customers

router.post('/signup', customerController.createCustomer); // Changed to /signup
router.post('/login', customerController.loginCustomer);   // New login route

router.get('/:customerId', customerController.getCustomerById);
router.put('/:customerId', customerController.updateCustomer);
router.delete('/:customerId', customerController.deleteCustomer);

// GET: *** ALGORITHM 2 SUPPORT ***
router.put('/:customerId/budget', customerController.updateBudgetPreference);

// GET: *** ALGORITHM 5 IMPLEMENTATION ***
router.get('/:customerId/suggestions', getPersonalizedSuggestions);

export default router;