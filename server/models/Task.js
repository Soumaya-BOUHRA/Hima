import mongoose from 'mongoose';

export const TASK_STATUS = ['pending', 'in-progress', 'completed'];
export const TASK_PRIORITY = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      minlength: [2, 'Le titre doit contenir au moins 2 caractères'],
      maxlength: [120, 'Le titre ne peut pas dépasser 120 caractères'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS,
        message: 'Statut invalide (pending | in-progress | completed)',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITY,
        message: 'Priorité invalide (low | medium | high)',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    project: {
      type: String,
      default: '',
      trim: true,
      maxlength: [60, 'Le nom du projet ne peut pas dépasser 60 caractères'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
