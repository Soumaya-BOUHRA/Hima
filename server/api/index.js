import app from '../app.js';
import connectDB from '../config/db.js';

// Vercel serverless entry point.
// The rewrites in vercel.json forward EVERY request to this function,
// and the Express app handles routing (/api/health, /api/auth/*, /api/tasks/*).
export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
    });
    return;
  }

  // Return the Express dispatch so the serverless function stays alive
  // until the response is fully sent.
  return app(req, res);
}
