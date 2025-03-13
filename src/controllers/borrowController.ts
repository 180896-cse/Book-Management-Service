import { Request, Response } from 'express';
import borrowService from '../services/borrowService';

/**
 * Borrow books
 * @param req Request object
 * @param res Response object
 */
export const borrowBooks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { bookIds } = req.body;

    const borrowings = await borrowService.borrowBooks(
      userId,
      bookIds,
    );

    res.status(201).json({
      message: 'Books borrowed successfully',
      borrowings,
    });
  } catch (error) {
    console.error('Borrow books error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while borrowing books' });
    }
  }
};

/**
 * Return borrowed books
 * @param req Request object
 * @param res Response object
 */
export const returnBooks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { borrowingIds } = req.body;

    await borrowService.returnBooks(userId, borrowingIds);

    res.json({ message: 'Books returned successfully' });
  } catch (error) {
    console.error('Return books error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while returning books' });
    }
  }
};

/**
 * Get all books borrowed by the current user
 * @param req Request object
 * @param res Response object
 */
export const getUserBorrowings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const returnedStatus =
      req.query.returned === 'true'
        ? true
        : req.query.returned === 'false'
        ? false
        : undefined;

    const borrowings = await borrowService.getUserBorrowings(
      userId,
      returnedStatus,
    );

    res.json({ borrowings });
  } catch (error) {
    console.error('Get user borrowings error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Server error while fetching borrowings' });
    }
  }
};

/**
 * Get borrowing statistics (admin only)
 * @param req Request object
 * @param res Response object
 */
export const getBorrowingStats = async (req: Request, res: Response) => {
  try {
    const stats = await borrowService.getBorrowingStats();

    res.json(stats);
  } catch (error) {
    console.error('Get borrowing stats error:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Server error while fetching borrowing statistics' });
    }
  }
};
