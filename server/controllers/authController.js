import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { ApiError, asyncHandler } from '../middleware/errorMiddleware.js';

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Le nom est requis');
  }
  if (!email || !String(email).trim()) {
    throw new ApiError(400, "L'email est requis");
  }
  if (!password || !String(password)) {
    throw new ApiError(400, 'Le mot de passe est requis');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'Un compte existe déjà avec cette adresse email');
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
  });

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      token: generateToken(user._id),
      user: sanitizeUser(user),
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, 'Email et mot de passe sont requis');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password'
  );

  if (!user || !(await user.matchPassword(String(password)))) {
    throw new ApiError(401, 'Identifiants invalides');
  }

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      token: generateToken(user._id),
      user: sanitizeUser(user),
    },
  });
});

/**
 * GET /api/auth/me  (protégé)
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Utilisateur courant',
    data: { user: sanitizeUser(req.user) },
  });
});
