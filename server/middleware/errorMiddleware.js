export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Enveloppe un contrôleur async : toute promesse rejetée est transmise
 * au gestionnaire d'erreurs centralisé.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Gestionnaire d'erreurs centralisé.
 * Toutes les réponses d'erreur suivent : { success: false, message: "..." }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode ||
    err.status ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Erreur interne du serveur';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Identifiant invalide : ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Un compte existe déjà avec cette adresse email';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide ou expiré';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expirée, veuillez vous reconnecter';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
