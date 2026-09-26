import jwt from 'jsonwebtoken';

const generateToken = (userId) =>
  jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

export default generateToken;
