import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/passwords';
import { generateToken } from '../middlewares/auth';
import { encryptText, decryptText } from '../utils/encryption';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.username, newUser.isAdmin);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, user.isAdmin);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        encryptedNotes: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        ...user,
        notes: user.encryptedNotes ? decryptText(user.encryptedNotes) : null,
      },
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
    const encryptedNotes = encryptText(notes);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { encryptedNotes },
    });

    res.json({ message: 'Notes saved successfully' });
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

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isAdmin: true },
    });

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Promote admin error:', error);
    res.status(500).json({ message: 'Server error while promoting user' });
  }
};
