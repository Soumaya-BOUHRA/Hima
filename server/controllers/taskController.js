import Task from '../models/Task.js';
import { ApiError, asyncHandler } from '../middleware/errorMiddleware.js';

const parseDueDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Date d'échéance invalide");
  }
  return date;
};

const buildPayload = (body) => {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title;
  if (body.description !== undefined) payload.description = body.description;
  if (body.status !== undefined) payload.status = body.status;
  if (body.priority !== undefined) payload.priority = body.priority;
  if (body.dueDate !== undefined) payload.dueDate = parseDueDate(body.dueDate);

  return payload;
};

/**
 * POST /api/tasks  (protégé)
 * L'utilisateur est toujours pris du JWT vérifié, jamais du body.
 */
export const createTask = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body || {});

  if (payload.title === undefined) {
    throw new ApiError(400, 'Le titre est requis');
  }

  const task = await Task.create({ ...payload, user: req.user._id });

  res.status(201).json({
    success: true,
    message: 'Tâche créée avec succès',
    data: { task },
  });
});

/**
 * GET /api/tasks  (protégé)
 * Retourne uniquement les tâches de l'utilisateur connecté.
 */
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    message: 'Liste des tâches',
    data: { tasks, count: tasks.length },
  });
});

/**
 * GET /api/tasks/:id  (protégé)
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, 'Tâche introuvable');
  }

  res.status(200).json({
    success: true,
    message: 'Tâche trouvée',
    data: { task },
  });
});

/**
 * PUT /api/tasks/:id  (protégé)
 */
export const updateTaskById = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body || {});

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: payload },
    { new: true, runValidators: true, context: 'query' }
  );

  if (!task) {
    throw new ApiError(404, 'Tâche introuvable');
  }

  res.status(200).json({
    success: true,
    message: 'Tâche mise à jour',
    data: { task },
  });
});

/**
 * DELETE /api/tasks/:id  (protégé)
 */
export const deleteTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, 'Tâche introuvable');
  }

  res.status(200).json({
    success: true,
    message: 'Tâche supprimée',
    data: { task },
  });
});
