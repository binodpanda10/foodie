import express from 'express';
const router = express.Router();
import * as ownerController from '../controllers/owner.controller.js';

// Base route: /api/owners

router.post('/', ownerController.createOwner);
router.get('/', ownerController.getAllOwners);
router.get('/:ownerId', ownerController.getOwnerById);
router.put('/:ownerId', ownerController.updateOwner);
router.delete('/:ownerId', ownerController.deleteOwner);

export default router;