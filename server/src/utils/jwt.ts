import jwt from 'jsonwebtoken';
import config from '../config';

export function signToken(payload: object, expiresIn = '1h') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtSecret);
}
