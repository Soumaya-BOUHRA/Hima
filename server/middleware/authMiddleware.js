import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ApiError, asyncHandler } from './errorMiddleware.js';

/**
 * Récupère le token dans l'en-tête `Authorization: Bearer <token>`.
 * Le userId n'est JAMAIS lu depuis le corps de la requête : il provient
 * toujours du payload du JWT vérifié, puis l'utilisateur est rechargé en base.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7).trim()
    : (req.headers['x-auth-token'] || '').trim();

  if (!token) {
    throw new ApiError(401, 'Accès refusé : token manquant');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expirée, veuillez vous reconnecter');
    }
    throw new ApiError(401, 'Token invalide ou expiré');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "L'utilisateur lié à ce token n'existe plus");
  }

  req.user = user;
  return next();
});

/**
 * Valide un paramètre d'URL de type ObjectId MongoDB avant toute requête.
 */
export const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!value || !mongoose.isValidObjectId(value)) {
    return next(new ApiError(400, `Identifiant invalide : ${value ?? 'manquant'}`));
  }
  return next();
};
