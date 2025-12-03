import express from 'express';
const router = express.Router();
import * as ownerController from '../controllers/owner.controller.js';

// Base route: /api/owners

router.post('/signup', ownerController.createOwner); // Changed to /signup for clarity
router.post('/login', ownerController.loginOwner);   // New login route

router.get('/', ownerController.getAllOwners);
router.get('/:ownerId', ownerController.getOwnerById);
router.put('/:ownerId', ownerController.updateOwner);
router.delete('/:ownerId', ownerController.deleteOwner);



export default router;