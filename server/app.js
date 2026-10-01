import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notFound from './middleware/notFoundMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();

// Accepts a comma-separated list so localhost + Vercel frontend can coexist:
// CLIENT_URL="http://localhost:5173,http://localhost:5174,https://xxx.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / curl / health checks (no Origin header)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin non autorisée : ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API opérationnelle',
    data: { uptime: process.uptime() },
  });
});
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running 🚀',
  });
});
// NOTE: no /api/projects route exists in this codebase — projects are
// derived client-side from tasks (see client/src/utils/task.js groupByProject).
// Existing routes preserved as-is:
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
