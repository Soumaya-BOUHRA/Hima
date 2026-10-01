import mongoose from 'mongoose';

// Cache the connection across serverless invocations (Vercel reuses
// the Node process between requests). Without this, every request
// would open a new MongoDB connection and exhaust the Atlas pool.
let cached = globalThis.__mongooseCache;
if (!cached) {
  cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('DEBUG MONGO_URI (JSON):', JSON.stringify(process.env.MONGO_URI?.slice(0, 15)));
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI manquant : définissez la variable d’environnement.');
    }
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, { family: 4 })
      .then((conn) => {
        console.log(`MongoDB connecté : ${conn.connection.host}`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`Erreur de connexion MongoDB : ${error.message}`);
    // Never process.exit() on Vercel — that kills the serverless function.
    // Locally (node server.js) an unhandled rejection still fails fast.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  return cached.conn;
};

export default connectDB;
