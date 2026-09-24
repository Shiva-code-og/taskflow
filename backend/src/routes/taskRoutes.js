import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Enforce token authentication for all routes in this router
router.use(authenticateToken);

// Route declarations mapped directly to controller actions
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;