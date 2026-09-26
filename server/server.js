import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notFound from './middleware/notFoundMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
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

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur TaskFlow démarré sur http://localhost:${PORT}`);
  });
});

export default app;
