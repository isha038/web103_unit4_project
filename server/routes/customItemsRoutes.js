import express from 'express';
import { 
  getCustomItems, 
  createCustomItem, 
  updateCustomItem, 
  deleteCustomItem 
} from '../controllers/customItemsController.js';

const router = express.Router();

// Route to get all custom cars and their selected features
router.get('/custom-items', getCustomItems);

// Route to create a new custom car with selected features
router.post('/custom-items', createCustomItem);

// Route to update a custom car and its selected features
router.put('/custom-items/:id', updateCustomItem);

// Route to delete a custom car and its selected features
router.delete('/custom-items/:id', deleteCustomItem);

export default router;
