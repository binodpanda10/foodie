import express from 'express';
const router = express.Router();
import * as customerController from '../controllers/customer.controller.js';

// Base route: /api/customers

router.post('/', customerController.createCustomer);
router.get('/:customerId', customerController.getCustomerById);
router.put('/:customerId', customerController.updateCustomer);
router.delete('/:customerId', customerController.deleteCustomer);
router.put('/:customerId/budget', customerController.updateBudgetPreference);

export default router;