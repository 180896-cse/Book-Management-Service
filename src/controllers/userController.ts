import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/passwords';
import { generateToken } from '../middlewares/auth';
import { encryptText, decryptText } from '../utils/encryption';
import userService from '../services/userService';
const prisma = new PrismaClient();

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const data = await userService.registerUser(username, password)
      .catch((err) => {
        throw err
      })
    res.status(201).json({
      message: 'User registered successfully',
      data
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const data = userService.userLogin(username, password)
      .catch((err: Error) => {
        throw err
      })
    res.json({
      message: 'Login successful',
      data
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const data = await userService.userProfile(req.user)
      .catch((err) => {
        throw err
      })
    res.json({
      data
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * Save encrypted notes for a user
 */
export const saveNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { notes } = req.body;
    const data = await userService.userNotes(req.user.id, notes)
      .catch((err) => {
        throw err
      })
    res.json({ message: data });
  } catch (error) {
    console.error('Save notes error:', error);
    res.status(500).json({ message: 'Server error while saving notes' });
  }
};

/**
 * Promote a user to admin (admin only)
 */
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const data = await userService.changeUserType(userId)
      .catch((err) => {
        throw err
      })
    res.json({ message: data });
  } catch (error) {
    console.error('Promote admin error:', error);
    res.status(500).json({ message: 'Server error while promoting user' });
  }
};
