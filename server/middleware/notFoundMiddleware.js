import { ApiError } from './errorMiddleware.js';

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route introuvable : ${req.method} ${req.originalUrl}`));
};

export default notFound;
