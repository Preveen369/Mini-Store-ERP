import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayloadWithUserId extends JwtPayload {
  userId: string;
}

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

export const verifyToken = (token: string): JwtPayloadWithUserId => {
  return jwt.verify(token, config.jwt.secret as Secret) as JwtPayloadWithUserId;
};
