import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // On Vercel (serverless) do NOT call listen() — see api/index.js.
  // Locally, start the HTTP server as before.
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Serveur TaskFlow démarré sur http://localhost:${PORT}`);
    });
  }
});

export default app;
