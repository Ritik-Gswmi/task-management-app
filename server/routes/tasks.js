import express from 'express';
import auth from '../middleware/auth.js';
import {
  createTask,
  deleteTask,
  listTasks,
  toggleTaskStatus,
  updateTask,
} from '../controllers/taskController.js';

const router = express.Router();
router.use(auth);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTaskStatus);
router.delete('/:id', deleteTask);

export default router;
