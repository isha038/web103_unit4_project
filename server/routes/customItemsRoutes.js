import express from 'express';
import { 
  getCustomItems, 
  createCustomItem, 
  updateCustomItem, 
  deleteCustomItem,
  getFeaturesWithOptions,
  getCustomItemById
} from '../controllers/customItemsController.js';

const router = express.Router();

router.get('/features-options', getFeaturesWithOptions);

// Route to get all custom cars and their selected features
router.get('/custom-items', getCustomItems);

// Route to get a single custom car by ID
router.get('/custom-items/:id', getCustomItemById);

// Route to create a new custom car with selected features
router.post('/custom-items', createCustomItem);

// Route to update a custom car and its selected features
router.put('/custom-items/:id', updateCustomItem);

// Route to delete a custom car and its selected features
router.delete('/custom-items/:id', deleteCustomItem);

export default router;
