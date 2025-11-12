import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret as Secret, {
    expiresIn: config.jwt.expire as SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret as Secret, {
    expiresIn: config.jwt.refreshExpire as SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.secret as Secret) as { userId: string };
};
