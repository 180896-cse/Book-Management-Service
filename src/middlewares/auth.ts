import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key-change-this';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        isAdmin: boolean;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      isAdmin: boolean;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (
  id: number,
  username: string,
  isAdmin: boolean,
): string => {
  return jwt.sign({ id, username, isAdmin }, JWT_SECRET, { expiresIn: '24h' });
};
