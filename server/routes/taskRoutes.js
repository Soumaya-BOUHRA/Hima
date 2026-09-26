import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
} from '../controllers/taskController.js';
import { protect, validateObjectId } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').post(createTask).get(getTasks);
router
  .route('/:id')
  .get(validateObjectId('id'), getTaskById)
  .put(validateObjectId('id'), updateTaskById)
  .delete(validateObjectId('id'), deleteTaskById);

export default router;
