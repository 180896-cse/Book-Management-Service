import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/passwords';
import { generateToken } from '../middlewares/auth';
import { encryptText, decryptText } from '../utils/encryption';

const prisma = new PrismaClient();
class UserService {
  async registerUser(username: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        throw new Error('Username already taken');
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
      const token = generateToken(
        newUser.id,
        newUser.username,
        newUser.isAdmin,
      );

      return ({
        user: {
          id: newUser.id,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error service:', error);
      return error;
    }
  }
  async userLogin(username: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid: boolean = await comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token: string = generateToken(user.id, user.username, user.isAdmin);

      return ({
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error('Login service error:', error);
      return error;
    }
  }
  async userProfile(user: any) {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          isAdmin: true,
          createdAt: true,
          encryptedNotes: true,
        },
      });

      if (!userData) {
        throw new Error('User not found');
      }

      return ({
        user: {
          ...userData,
          notes: userData.encryptedNotes
            ? decryptText(userData.encryptedNotes)
            : null,
        },
      });
    } catch (error) {
      console.error('get profile service error:', error);
      return error;
    }
  }
  async userNotes(userId: number, notes: string) {
    try {
      const encryptedNotes = encryptText(notes);

      await prisma.user.update({
        where: { id: userId },
        data: { encryptedNotes },
      });

      return ('Notes saved successfully');
    } catch (error) {
      console.error('save notes service error:', error);
      return error;
    }
  }
  async changeUserType(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await prisma.user.update({
        where: { id: Number(userId) },
        data: { isAdmin: true },
      });

      return ('User promoted to admin successfully');
    } catch (error) {
      console.error('save notes service error:', error);
      return (error);
    }
  }
}

const userService = new UserService();
export default userService;